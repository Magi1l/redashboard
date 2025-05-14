import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import { connectDB } from "@/lib/mongodb";
import UserDefault from "@/lib/models/User";

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

export async function GET() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  // 포인트 기준 상위 50명 랭킹 반환
  const rawRanking = await UserDefault.find({}).sort({ points: -1 }).limit(50).lean();
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