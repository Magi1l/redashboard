import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendSlackAlert } from "@/lib/monitoring/alert";

const ADMIN_EMAIL = "admin@example.com"; // 실제 운영자 이메일로 교체

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  await sendSlackAlert(`[테스트] 임계치 초과 테스트 알림 (운영자: ${session.user.email})`, { test: true });
  return NextResponse.json({ ok: true });
} 