import { NextRequest, NextResponse } from "next/server";
import { recordMetric } from "@/lib/monitoring/metrics";
import { startTimer, endTimer } from "@/lib/monitoring/performance";
import { sendSlackAlert } from "@/lib/monitoring/alert";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAIL = "admin@example.com"; // 실제 운영자 이메일로 교체

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  const timer = startTimer("/api/hello");
  let status = 200;
  let errorMsg = undefined;
  try {
    // 일부러 에러 시뮬레이션 (10% 확률)
    if (Math.random() < 0.1) throw new Error("테스트 에러 발생!");
    // 정상 응답
    return NextResponse.json({ message: "Hello, world!" });
  } catch (err: unknown) {
    let errorMsgText = "알 수 없는 오류";
    if (err instanceof Error) errorMsgText = err.message;
    else if (typeof err === "string") errorMsgText = err;
    status = 500;
    errorMsg = errorMsgText;
    // 에러 발생 시 슬랙 알림 전송
    await sendSlackAlert(`[API ERROR] /api/hello: ${errorMsgText}`);
    return NextResponse.json({ error: errorMsgText }, { status });
  } finally {
    const duration = endTimer(timer);
    recordMetric("/api/hello", status, duration, errorMsg);
  }
} 