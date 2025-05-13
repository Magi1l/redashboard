type LogLevel = "error" | "warn" | "info" | "debug";

const LEVEL_COLORS: Record<LogLevel, string> = {
  error: "\x1b[31m", // red
  warn: "\x1b[33m", // yellow
  info: "\x1b[36m", // cyan
  debug: "\x1b[90m", // gray
};
const RESET = "\x1b[0m";

function shouldLog(level: LogLevel) {
  const env = process.env.NODE_ENV;
  if (env === "production") return ["error", "warn", "info"].includes(level);
  return true; // dev: 모두 출력
}

export function logger(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (!shouldLog(level)) return;
  const ts = new Date().toISOString();
  const color = LEVEL_COLORS[level] || "";
  const ctx = context ? ` ${JSON.stringify(context)}` : "";
  // eslint-disable-next-line no-console
  console.log(`${color}[${ts}] [${level.toUpperCase()}]${RESET} ${message}${ctx}`);
}

export const log = {
  error: (msg: string, ctx?: Record<string, unknown>) => logger("error", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => logger("warn", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => logger("info", msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => logger("debug", msg, ctx),
}; 