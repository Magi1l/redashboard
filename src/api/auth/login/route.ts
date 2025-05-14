import { NextResponse } from "next/server";
import { getDiscordLoginUrl } from "@/lib/auth/discord";

export async function GET() {
  // 실제 서비스에서는 state를 랜덤/쿠키로 관리 권장
  const state = "state";
  const url = getDiscordLoginUrl(state);
  return NextResponse.redirect(url);
} 