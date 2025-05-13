import { getErrorMessage } from "../errors/messages";

export function errorResponse(error: any, status: number = 500, lang: "ko" | "en" = "ko") {
  const isDev = process.env.NODE_ENV === "development";
  let code = "BE1000";
  let message = getErrorMessage(code, lang);
  let detail: string | undefined = undefined;
  if (error && typeof error === "object") {
    if (error.code) code = error.code;
    message = getErrorMessage(code, lang);
    if (error.message && isDev) message = error.message; // 개발환경에서는 원본 메시지 우선
    if (isDev && error.stack) detail = error.stack;
  }
  return {
    success: false,
    error: { code, message, ...(isDev && detail ? { detail } : {}) },
  };
} 