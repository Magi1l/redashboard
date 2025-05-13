import { log } from "./logger";

function maskSensitive(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  const SENSITIVE = ["authorization", "cookie", "token", "password", "secret"];
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [SENSITIVE.includes(k.toLowerCase()) ? k : k, SENSITIVE.includes(k.toLowerCase()) ? "***" : v])
  );
}

// Next.js app router용 requestLogger (함수형 래퍼)
export function withRequestLogger(handler: (req: any, res: any) => Promise<any> | any, endpoint: string) {
  return async (req: any, res: any) => {
    const start = Date.now();
    const method = req.method || req.method;
    const url = req.url || endpoint;
    const headers = maskSensitive(req.headers || {});
    let status = 200;
    let errorMsg = undefined;
    let result;
    try {
      log.info("API 요청", { method, url, headers });
      result = await handler(req, res);
      if (result?.status) status = result.status;
      log.info("API 응답", { method, url, status, ms: Date.now() - start });
      return result;
    } catch (err: any) {
      status = 500;
      errorMsg = err?.message || "unknown error";
      log.error("API 에러", { method, url, status, error: errorMsg });
      throw err;
    }
  };
} 