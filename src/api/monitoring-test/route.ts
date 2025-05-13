import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordMetric } from "@/lib/monitoring/metrics";
import { startTimer, endTimer } from "@/lib/monitoring/performance";
import { sendSlackAlert } from "@/lib/monitoring/alert";

const ADMIN_EMAIL = "admin@example.com"; // 실제 운영자 이메일로 교체

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  const timer = startTimer("/api/monitoring-test");
  let status = 200;
  let errorMsg = undefined;
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "ok";
    if (type === "error") throw new Error("강제 에러 발생 (실습)");
    if (type === "slow") await new Promise(res => setTimeout(res, 2500)); // 2.5초 지연(성능 임계치 초과)
    if (type === "alert") await sendSlackAlert("[실습] 수동 알림 트리거");
    return NextResponse.json({ message: `테스트 성공 (${type})` });
  } catch (err: unknown) {
    let errorMsgText = "알 수 없는 오류";
    if (err instanceof Error) errorMsgText = err.message;
    else if (typeof err === "string") errorMsgText = err;
    status = 500;
    errorMsg = errorMsgText;
    await sendSlackAlert(`[API ERROR] /api/monitoring-test: ${errorMsgText}`);
    return NextResponse.json({ error: errorMsgText }, { status });
  } finally {
    const duration = endTimer(timer);
    recordMetric("/api/monitoring-test", status, duration, errorMsg);
  }
} 