type LogLevel = 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

const ENVIRONMENT = process.env.NODE_ENV ?? 'development';

function sanitizeMeta(meta?: LogContext) {
  if (!meta) {
    return undefined;
  }

  return JSON.parse(
    JSON.stringify(meta, (_key, value) => {
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      return value;
    }),
  );
}

function writeLog(level: LogLevel, message: string, meta?: LogContext) {
  const payload = {
    level,
    message,
    meta: sanitizeMeta(meta),
    timestamp: new Date().toISOString(),
    environment: ENVIRONMENT,
  };

  const serialized = JSON.stringify(payload);

  switch (level) {
    case 'error':
      console.error(serialized);
      break;
    case 'warn':
      console.warn(serialized);
      break;
    default:
      console.info(serialized);
  }
}

export function logInfo(message: string, meta?: LogContext) {
  writeLog('info', message, meta);
}

export function logWarn(message: string, meta?: LogContext) {
  writeLog('warn', message, meta);
}

export function logError(message: string, meta?: LogContext) {
  writeLog('error', message, meta);
}
