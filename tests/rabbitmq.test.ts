import { describe, expect, it, vi } from 'vitest';

const baseEnv = {
  NODE_ENV: 'test',
  APP_URL: 'http://localhost:3000',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  REDIS_URL: 'redis://localhost:6379',
  RABBITMQ_URL: '',
  RABBITMQ_HOST: 'rabbit.example.com',
  RABBITMQ_PORT: '10135',
  RABBITMQ_USERNAME: '',
  RABBITMQ_PASSWORD: '',
  RABBITMQ_VHOST: '/'
};

async function loadRabbitMqModule() {
  vi.resetModules();
  return import('../lib/rabbitmq');
}

describe('rabbitmq', () => {
  it('builds a RabbitMQ URL from host and port', async () => {
    process.env = {
      ...process.env,
      ...baseEnv
    };

    const { getRabbitMqUrl } = await loadRabbitMqModule();

    expect(getRabbitMqUrl()).toBe('amqp://rabbit.example.com:10135/%2f');
  });

  it('prefers a full RabbitMQ URL when one is provided', async () => {
    process.env = {
      ...process.env,
      ...baseEnv,
      RABBITMQ_URL: 'amqps://user:pass@broker.example.com:5671/vhost'
    };

    const { getRabbitMqUrl } = await loadRabbitMqModule();

    expect(getRabbitMqUrl()).toBe('amqps://user:pass@broker.example.com:5671/vhost');
  });
});