import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest, ev: any) {
  try {
    return await ev();
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "서버 에러" }, { status: 500 });
  }
} 