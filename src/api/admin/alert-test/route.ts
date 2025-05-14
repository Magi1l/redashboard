import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import { sendDiscordAlert } from "@/lib/monitoring/alert";

const ADMIN_EMAIL = "admin@example.com"; // 실제 운영자 이메일로 교체

export async function POST() {
  const user = await getServerUser();
  if (!user || typeof user === "string" || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  await sendDiscordAlert(`[테스트] 임계치 초과 테스트 알림 (운영자: ${user.email})`, { test: true });
  return NextResponse.json({ ok: true });
} 