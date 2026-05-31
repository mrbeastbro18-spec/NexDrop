import amqp, { Channel, ChannelModel } from 'amqplib';
import { env } from './env';

export const EMAIL_QUEUE_NAME = 'email:queue';

let connectionPromise: Promise<ChannelModel | null> | null = null;
let channelPromise: Promise<Channel | null> | null = null;

function normalizeVHost(vhost: string): string {
  if (!vhost || vhost === '/') return '%2f';
  return encodeURIComponent(vhost.startsWith('/') ? vhost : `/${vhost}`);
}

export function getRabbitMqUrl(): string {
  if (env.RABBITMQ_URL) return env.RABBITMQ_URL;
  if (!env.RABBITMQ_HOST) return '';

  const auth = env.RABBITMQ_USERNAME
    ? `${encodeURIComponent(env.RABBITMQ_USERNAME)}:${encodeURIComponent(env.RABBITMQ_PASSWORD || '')}@`
    : '';
  const vhost = normalizeVHost(env.RABBITMQ_VHOST);
  return `amqp://${auth}${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}/${vhost}`;
}

export function isRabbitMqConfigured(): boolean {
  return Boolean(getRabbitMqUrl());
}

async function connectRabbitMq(): Promise<ChannelModel | null> {
  const url = getRabbitMqUrl();
  if (!url) return null;

  if (!connectionPromise) {
    connectionPromise = amqp.connect(url).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  try {
    return await connectionPromise;
  } catch (error) {
    console.error('RabbitMQ connection failed:', error);
    return null;
  }
}

export async function getRabbitMqChannel(): Promise<Channel | null> {
  if (channelPromise) return channelPromise;

  channelPromise = (async () => {
    const connection = await connectRabbitMq();
    if (!connection) return null;

    const channel = await connection.createChannel();
    await channel.assertQueue(EMAIL_QUEUE_NAME, { durable: true });

    connection.on('close', () => {
      connectionPromise = null;
      channelPromise = null;
    });

    connection.on('error', () => {
      connectionPromise = null;
      channelPromise = null;
    });

    return channel;
  })().catch((error) => {
    channelPromise = null;
    console.error('RabbitMQ channel setup failed:', error);
    return null;
  });

  return channelPromise;
}

export async function publishRabbitMqMessage(queue: string, payload: unknown): Promise<boolean> {
  const channel = await getRabbitMqChannel();
  if (!channel) return false;

  try {
    const published = channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      contentType: 'application/json',
      persistent: true
    });

    if (!published) {
      console.error('RabbitMQ publish backpressure for queue:', queue);
      return false;
    }

    return true;
  } catch (error) {
    console.error('RabbitMQ publish failed:', error);
    connectionPromise = null;
    channelPromise = null;
    return false;
  }
}