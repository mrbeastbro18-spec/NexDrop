import { env } from './env';

type LogLevel = 'info' | 'warn' | 'error';

function safeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    };
  }

  return error;
}

function shouldLog(level: LogLevel) {
  if (level === 'error') return true;
  return env.ENABLE_DEBUG_LOGS || env.NODE_ENV !== 'production';
}

export function logServer(level: LogLevel, message: string, details?: Record<string, unknown>) {
  if (!shouldLog(level)) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(details || {})
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === 'warn') {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

export function logServerError(message: string, error: unknown, details?: Record<string, unknown>) {
  logServer('error', message, {
    ...(details || {}),
    error: safeError(error)
  });
}
