import { getRedis } from './redis';
import { EmailQueueJob, sendEmail } from './email';
import { env } from './env';
import { EMAIL_QUEUE_NAME, getRabbitMqChannel, isRabbitMqConfigured } from './rabbitmq';

async function processEmailJob(payload: EmailQueueJob, requeue: (job: EmailQueueJob) => Promise<void>) {
  try {
    await sendEmail(payload.job);
  } catch (error) {
    console.error('Email send failed, requeueing', error);
    payload.attempts = (payload.attempts || 0) + 1;
    if (payload.attempts <= env.EMAIL_QUEUE_RETRIES) {
      await requeue(payload);
    } else {
      console.error('Dropping email after retries', payload.job.to, payload.job.subject);
    }
  }
}

async function runRabbitWorker() {
  const channel = await getRabbitMqChannel();
  if (!channel) return false;

  await channel.prefetch(1);
  console.log('Email worker started (RabbitMQ)');

  const shutdownPromise = new Promise<void>((resolve) => {
    const finish = () => resolve();
    channel.once('close', finish);
    channel.once('error', finish);
  });

  try {
    await channel.consume(EMAIL_QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString('utf-8')) as EmailQueueJob;
        await processEmailJob(payload, async (job) => {
          channel.sendToQueue(EMAIL_QUEUE_NAME, Buffer.from(JSON.stringify(job)), {
            contentType: 'application/json',
            persistent: true
          });
        });
        channel.ack(msg);
      } catch (error) {
        console.error('RabbitMQ worker message failed', error);
        channel.ack(msg);
      }
    });

    await shutdownPromise;
  } catch (error) {
    console.error('RabbitMQ worker stopped unexpectedly', error);
  }

  console.error('RabbitMQ worker stopped, switching queue backend');
  return false;
}

async function runRedisWorker() {
  const redis = getRedis();
  if (!redis) {
    console.error('Redis not configured, email worker cannot run');
    process.exit(1);
  }

  console.log('Email worker started (Redis)');
  while (true) {
    try {
      const res = await redis.blpop('email:queue', 5);
      if (!res) continue;
      const payload = JSON.parse(res[1]) as EmailQueueJob;
      await processEmailJob(payload, async (job) => {
        await redis.rpush('email:queue', JSON.stringify(job));
      });
    } catch (err) {
      console.error('Worker error', err);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function workerLoop() {
  if (isRabbitMqConfigured()) {
    const started = await runRabbitWorker();
    if (started) return;
    console.error('RabbitMQ not available, falling back to Redis');
  }

  await runRedisWorker();
}

if (require.main === module) {
  workerLoop();
}
