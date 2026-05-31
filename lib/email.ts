import nodemailer from 'nodemailer';
import { env } from './env';
import { getRedis } from './redis';
import fs from 'fs/promises';
import path from 'path';
import { EMAIL_QUEUE_NAME, isRabbitMqConfigured, publishRabbitMqMessage } from './rabbitmq';

type Mail = {
  to: string;
  subject: string;
  html: string;
};

async function createTransport() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
  });
}

export async function sendEmail(mail: Mail) {
  const transport = await createTransport();
  if (!transport) {
    if (process.env.NODE_ENV !== 'production') console.log('Email skipped (SMTP not configured):', mail.subject, mail.to);
    return;
  }

  await transport.sendMail({ from: env.EMAIL_FROM, to: mail.to, subject: mail.subject, html: mail.html });
}

// Template rendering
export async function renderTemplate(name: string, vars: Record<string, any>) {
  const file = path.join(process.cwd(), 'lib', 'email_templates', `${name}.html`);
  try {
    const tpl = await fs.readFile(file, 'utf-8');
    return tpl.replace(/{{\s*([\w.-]+)\s*}}/g, (_match, key) => {
      const value = vars[key];
      return value === undefined || value === null ? '' : String(value);
    });
  } catch (e) {
    console.error('Template render error', e);
    throw e;
  }
}

// Queueing
export async function queueEmail(templateName: string, to: string, subject: string, vars: Record<string, any> = {}) {
  // If queue disabled, render and send immediately
  const body = await renderTemplate(templateName, vars);
  const job = { to, subject, html: body };

  if (!env.EMAIL_QUEUE_ENABLED) {
    await sendEmail(job);
    return;
  }

  if (isRabbitMqConfigured()) {
    try {
      const enqueued = await publishRabbitMqMessage(EMAIL_QUEUE_NAME, { job, attempts: 0 });
      if (enqueued) return;
    } catch (error) {
      console.error('RabbitMQ enqueue failed, falling back to Redis', error);
    }
  }

  const redis = getRedis();
  if (!redis) {
    // fallback to immediate send
    await sendEmail(job);
    return;
  }

  await redis.rpush('email:queue', JSON.stringify({ job, attempts: 0 }));
}

export type EmailQueueJob = { job: Mail; attempts: number };

