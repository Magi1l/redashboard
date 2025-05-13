import { log } from "./logger";
import { IncomingMessage, ServerResponse } from "http";

function maskSensitive(obj: unknown) {
  if (!obj || typeof obj !== "object") return obj;
  const SENSITIVE = ["authorization", "cookie", "token", "password", "secret"];
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [SENSITIVE.includes(k.toLowerCase()) ? k : k, SENSITIVE.includes(k.toLowerCase()) ? "***" : v])
  );
}

// Next.js app router용 requestLogger (함수형 래퍼)
export function withRequestLogger(
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<unknown> | unknown,
  endpoint: string
) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<unknown> => {
    const start = Date.now();
    const method = (req as any).method || (req as any).method;
    const url = (req as any).url || endpoint;
    const headers = maskSensitive((req as any).headers || {});
    let status = 200;
    let errorMsg: string | undefined = undefined;
    let result: unknown;
    try {
      log.info("API 요청", { method, url, headers });
      result = await handler(req, res);
      if ((result as any)?.status) status = (result as any).status;
      log.info("API 응답", { method, url, status, ms: Date.now() - start });
      return result;
    } catch (err: unknown) {
      status = 500;
      errorMsg = (err as Error)?.message || "unknown error";
      log.error("API 에러", { method, url, status, error: errorMsg });
      throw err;
    }
  };
} 