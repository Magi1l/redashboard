import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserDefault from "@/lib/models/User";
import LevelDefault from "@/lib/models/Level";
import PurchaseDefault from "@/lib/models/Purchase";
import type { PurchaseDocument } from "@/lib/models/Purchase";
import type { Model } from "mongoose";
import { errorResponse } from "@/lib/middleware/errorResponse";
import { recordMetric } from "@/lib/monitoring/metrics";
import { log } from "@/lib/logging/logger";
import { measureDbQuery } from "@/lib/monitoring/performance";
import mongoose from "mongoose";

// User, Level, Purchase lean 타입 명확화
interface UserLean {
  discordId: string;
  username?: string;
  avatar?: string;
  servers?: string[];
  points?: number;
  purchases?: string[];
  profileBackground?: string;
}
interface LevelLean {
  userId: string;
  guildId: string;
  xp: number;
  level: number;
  lastMessage: Date;
  xpHistory: { date: Date; amount: number }[];
}
interface PurchaseLean {
  userId: string;
  itemId: string;
  guildId: string;
  purchasedAt: Date;
  quantity: number;
}
// User, Level mongoose 타입 명확화
interface UserDoc extends mongoose.Document {
  discordId: string;
  username?: string;
  avatar?: string;
  servers?: string[];
  points: number;
  purchases?: string[];
  profileBackground?: string;
}
interface LevelDoc extends mongoose.Document {
  userId: string;
  guildId: string;
  xp: number;
  level: number;
  lastMessage: Date;
  xpHistory: { date: Date; amount: number }[];
}
const User = UserDefault as mongoose.Model<UserDoc>;
const Level = LevelDefault as mongoose.Model<LevelDoc>;
const Purchase = PurchaseDefault as Model<PurchaseDocument>;

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
      return NextResponse.json(
        errorResponse({ code: "BE4001", message: errorMsg }),
        { status },
      );
    }
    const user = (await measureDbQuery("User.findOne", () =>
      User.findOne({ discordId }).lean(),
    )) as UserLean | null;
    const level = (await measureDbQuery("Level.findOne", () =>
      Level.findOne({ userId: discordId, guildId }).lean(),
    )) as LevelLean | null;
    const purchasesRaw = await measureDbQuery("Purchase.find", () =>
      Purchase.find({ userId: discordId, guildId }).lean(),
    );
    const purchases: PurchaseLean[] = Array.isArray(purchasesRaw)
      ? purchasesRaw.map((p) => ({
          userId: p.userId?.toString?.() ?? String(p.userId),
          itemId: p.itemId?.toString?.() ?? String(p.itemId),
          guildId: p.guildId?.toString?.() ?? String(p.guildId),
          purchasedAt:
            p.purchasedAt !== undefined ? p.purchasedAt : new Date(0),
          quantity: p.quantity !== undefined ? p.quantity : 1,
        }))
      : [];
    log.info("프로필 데이터 조회 성공", { discordId, guildId });
    return NextResponse.json({ user, level, purchases });
  } catch (err: unknown) {
    let errorMsgText = "unknown error";
    if (err instanceof Error) errorMsgText = err.message;
    else if (typeof err === "string") errorMsgText = err;
    status = 500;
    errorMsg = errorMsgText;
    log.error("프로필 API 에러", { error: errorMsg });
    return NextResponse.json(errorResponse(err), { status });
  } finally {
    recordMetric(endpoint, status, Date.now() - start, errorMsg);
  }
}
