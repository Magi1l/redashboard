import { log } from "./logger";
import { IncomingMessage, ServerResponse, IncomingHttpHeaders } from "http";

function maskSensitive(obj: unknown) {
  if (!obj || typeof obj !== "object") return obj;
  const SENSITIVE = ["authorization", "cookie", "token", "password", "secret"];
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [SENSITIVE.includes(k.toLowerCase()) ? k : k, SENSITIVE.includes(k.toLowerCase()) ? "***" : v])
  );
}

// req 타입 확장 (headers는 IncomingHttpHeaders로 명확화)
interface ReqWithMeta extends IncomingMessage {
  method?: string;
  url?: string;
  headers: IncomingHttpHeaders;
}

// Next.js app router용 requestLogger (함수형 래퍼)
export function withRequestLogger(
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<unknown> | unknown,
  endpoint: string
) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<unknown> => {
    const start = Date.now();
    const { method, url, headers } = req as ReqWithMeta;
    const safeMethod = method || "";
    const safeUrl = url || endpoint;
    const safeHeaders = maskSensitive(headers || {});
    let status = 200;
    let errorMsg: string | undefined = undefined;
    let result: unknown;
    try {
      log.info("API 요청", { method: safeMethod, url: safeUrl, headers: safeHeaders });
      result = await handler(req, res);
      if ((result as { status?: number })?.status) status = (result as { status?: number }).status!;
      log.info("API 응답", { method: safeMethod, url: safeUrl, status, ms: Date.now() - start });
      return result;
    } catch (err: unknown) {
      status = 500;
      errorMsg = (err as Error)?.message || "unknown error";
      log.error("API 에러", { method: safeMethod, url: safeUrl, status, error: errorMsg });
      throw err;
    }
  };
} 