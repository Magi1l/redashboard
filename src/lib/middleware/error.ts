import { NextApiRequest, NextApiResponse } from 'next';

// 커스텀 에러 클래스
export class ApiError extends Error {
  status: number;
  code: string;
  detail?: string;
  constructor({ message, status = 500, code = 'BE1000', detail }: { message: string; status?: number; code?: string; detail?: string }) {
    super(message);
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

// 표준 에러 핸들러 래퍼
export function withError(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | unknown) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (err: unknown) {
      const isDev = process.env.NODE_ENV === 'development';
      let status = 500;
      let code = 'BE1000';
      let message = '서버 내부 오류가 발생했습니다.';
      let detail: string | undefined = undefined;
      if (err instanceof ApiError) {
        status = err.status;
        code = err.code;
        message = err.message;
        detail = err.detail;
      } else if (err instanceof Error) {
        message = isDev ? err.message : message;
        detail = isDev ? err.stack : undefined;
      }
      res.status(status).json({
        success: false,
        error: {
          code,
          message,
          ...(isDev && detail ? { detail } : {}),
        },
      });
    }
  };
} 