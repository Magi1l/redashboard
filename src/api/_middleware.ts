import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest, ev: () => Promise<Response> | Response) {
  try {
    return await ev();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 에러";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 