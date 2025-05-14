import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import UserDefault from "@/lib/models/User";
import type { UserDocument } from "@/lib/models/User";
import mongoose from "mongoose";

// User lean 타입 명확화
interface UserLean {
  discordId: string;
  username?: string;
  avatar?: string;
  servers?: string[];
  points?: number;
  purchases?: string[];
  profileBackground?: string;
}

const User = UserDefault as mongoose.Model<UserDocument>;

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // 포인트 기준 상위 50명 랭킹 반환
  const rawRanking = await User.find({}).sort({ points: -1 }).limit(50).lean();
  const ranking: UserLean[] = Array.isArray(rawRanking)
    ? rawRanking.map((u) => ({
        discordId: u.discordId,
        username: u.username,
        avatar: u.avatar,
        servers: u.servers,
        points: u.points,
        purchases: u.purchases,
        profileBackground: u.profileBackground,
      }))
    : [];
  return NextResponse.json({ ranking });
} 