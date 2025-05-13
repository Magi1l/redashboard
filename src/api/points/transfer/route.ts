import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserDefault from "@/lib/models/User";
import mongoose from "mongoose";

const User = UserDefault as mongoose.Model<any>;

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await mongoose.startSession();
  let fromDiscordId: string, toDiscordId: string, amount: number;
  try {
    const body = await req.json();
    fromDiscordId = body.fromDiscordId;
    toDiscordId = body.toDiscordId;
    amount = Number(body.amount);
    if (!fromDiscordId || !toDiscordId || !amount) {
      throw new Error("필수 정보 누락");
    }
    if (fromDiscordId === toDiscordId) {
      throw new Error("본인에게 이체할 수 없습니다.");
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("이체 금액이 올바르지 않습니다.");
    }
    await session.withTransaction(async () => {
      const fromUser = await User.findOne({ discordId: fromDiscordId }).session(session);
      const toUser = await User.findOne({ discordId: toDiscordId }).session(session);
      if (!fromUser || !toUser) {
        throw new Error("유저를 찾을 수 없습니다.");
      }
      if (fromUser.points < amount) {
        throw new Error("포인트가 부족합니다.");
      }
      fromUser.points -= amount;
      toUser.points += amount;
      await fromUser.save({ session });
      await toUser.save({ session });
      // TODO: 이체 내역 기록, 알림 등 부수효과는 추후 확장
    });
    session.endSession();
    // 트랜잭션 성공 시 최신 포인트 반환
    const fromUser = await User.findOne({ discordId: fromDiscordId });
    const toUser = await User.findOne({ discordId: toDiscordId });
    return NextResponse.json({ success: true, fromPoints: fromUser?.points, toPoints: toUser?.points });
  } catch (err: any) {
    session.endSession();
    return NextResponse.json({ success: false, error: err.message || "포인트 이체 중 오류 발생" }, { status: 500 });
  }
} 