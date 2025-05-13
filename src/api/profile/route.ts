import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Level from "@/lib/models/Level";
import Purchase from "@/lib/models/Purchase";
import { errorResponse } from "@/lib/middleware/errorResponse";
import { recordMetric } from "@/lib/monitoring/metrics";
import { log } from "@/lib/logging/logger";
import { measureDbQuery } from "@/lib/monitoring/performance";

export async function GET(req: NextRequest) {
  const endpoint = "/api/profile";
  const start = Date.now();
  let status = 200;
  let errorMsg = undefined;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const discordId = searchParams.get("discordId");
    const guildId = searchParams.get("guildId");
    log.info("프로필 API 요청", { discordId, guildId });
    if (!discordId || !guildId) {
      status = 400;
      errorMsg = "discordId, guildId required";
      log.warn("필수 파라미터 누락", { discordId, guildId });
      return NextResponse.json(errorResponse({ code: "BE4001", message: errorMsg }, 400), { status });
    }
    // @ts-ignore
    const user = await measureDbQuery("User.findOne", () => (User as any).findOne({ discordId }).lean());
    // @ts-ignore
    const level = await measureDbQuery("Level.findOne", () => (Level as any).findOne({ userId: discordId, guildId }).lean());
    // @ts-ignore
    const purchases = await measureDbQuery("Purchase.find", () => (Purchase as any).find({ userId: discordId, guildId }).lean());
    log.info("프로필 데이터 조회 성공", { discordId, guildId });
    return NextResponse.json({ user, level, purchases });
  } catch (err: any) {
    status = 500;
    errorMsg = err?.message || "unknown error";
    log.error("프로필 API 에러", { error: errorMsg });
    return NextResponse.json(errorResponse(err), { status });
  } finally {
    recordMetric(endpoint, status, Date.now() - start, errorMsg);
  }
} 