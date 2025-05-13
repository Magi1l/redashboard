import { getErrorMessage } from "../errors/messages";

export function errorResponse(error: unknown, status: number = 500, lang: "ko" | "en" = "ko") {
  const isDev = process.env.NODE_ENV === "development";
  // let code, message, detail 모두 에러 핸들링 흐름상 재할당 필요하므로 let 유지
  let code = "BE1000";
  let message = getErrorMessage(code, lang);
  let detail: string | undefined = undefined;
  if (error && typeof error === "object") {
    const errObj = error as { code?: string; message?: string; stack?: string };
    if (errObj.code) {
      code = errObj.code;
    }
    message = getErrorMessage(code, lang);
    if (errObj.message && isDev) message = errObj.message; // 개발환경에서는 원본 메시지 우선
    if (isDev && errObj.stack) detail = errObj.stack;
  }
  return {
    success: false,
    error: { code, message, ...(isDev && detail ? { detail } : {}) },
  };
} 