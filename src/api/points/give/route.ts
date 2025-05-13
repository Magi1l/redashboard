import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserDefault from "@/lib/models/User";
import mongoose from "mongoose";

// UserDocument 타입 명확화
interface UserDocument extends mongoose.Document {
  discordId: string;
  username?: string;
  avatar?: string;
  servers?: string[];
  points: number;
  purchases?: string[];
  profileBackground?: string;
}

const User = UserDefault as mongoose.Model<UserDocument>;

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await mongoose.startSession();
  // let discordId, amount 모두 재할당 필요하므로 let 유지
  try {
    const body = await req.json();
    const discordId = body.discordId;
    const amount = Number(body.amount);
    if (!discordId || !amount) {
      throw new Error("필수 정보 누락");
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("지급 금액이 올바르지 않습니다.");
    }
    await session.withTransaction(async () => {
      const user = await User.findOne({ discordId }).session(session);
      if (!user) {
        throw new Error("유저를 찾을 수 없습니다.");
      }
      user.points += amount;
      await user.save({ session });
    });
    session.endSession();
    // 트랜잭션 성공 시 최신 포인트 반환
    const user = await User.findOne({ discordId });
    return NextResponse.json({ success: true, points: user?.points });
  } catch (err: any) {
    session.endSession();
    return NextResponse.json({ success: false, error: err.message || "포인트 지급 중 오류 발생" }, { status: 500 });
  }
} 