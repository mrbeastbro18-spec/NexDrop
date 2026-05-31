import { afterEach, describe, expect, it, vi } from 'vitest';

const baseEnv = {
  NODE_ENV: 'test',
  APP_URL: 'http://localhost:3000',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  EMAIL_QUEUE_ENABLED: 'true',
  EMAIL_QUEUE_RETRIES: '3',
  SMTP_HOST: '',
  SMTP_USER: '',
  SMTP_PASS: '',
  REDIS_URL: 'redis://localhost:6379',
  RABBITMQ_URL: '',
  RABBITMQ_HOST: 'rabbit.example.com',
  RABBITMQ_PORT: '10135',
  RABBITMQ_USERNAME: '',
  RABBITMQ_PASSWORD: '',
  RABBITMQ_VHOST: '/'
};

const { rpushMock, publishMock } = vi.hoisted(() => ({
  rpushMock: vi.fn(),
  publishMock: vi.fn(async () => {
    throw new Error('rabbit unavailable');
  })
}));

vi.mock('../lib/redis', () => ({
  getRedis: vi.fn(() => ({
    rpush: rpushMock
  }))
}));

vi.mock('../lib/rabbitmq', () => ({
  EMAIL_QUEUE_NAME: 'email:queue',
  isRabbitMqConfigured: vi.fn(() => true),
  publishRabbitMqMessage: publishMock
}));

vi.mock('fs/promises', () => ({
  __esModule: true,
  default: {
    readFile: vi.fn(async () => 'Hello {{name}}')
  },
  readFile: vi.fn(async () => 'Hello {{name}}')
}));

afterEach(() => {
  process.env = {
    ...process.env,
    ...baseEnv
  };
  rpushMock.mockReset();
  publishMock.mockReset();
  publishMock.mockImplementation(async () => {
    throw new Error('rabbit unavailable');
  });
});

describe('email queue fallback', () => {
  it('falls back to Redis when RabbitMQ publish fails', async () => {
    process.env = {
      ...process.env,
      ...baseEnv
    };

    vi.resetModules();
    const { queueEmail } = await import('../lib/email');

    await queueEmail('test-template', 'user@example.com', 'Subject', { name: 'NexDrop' });

    expect(publishMock).toHaveBeenCalledTimes(1);
    expect(rpushMock).toHaveBeenCalledTimes(1);
    expect(rpushMock).toHaveBeenCalledWith(
      'email:queue',
      expect.stringContaining('user@example.com')
    );
  });
});