import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import User from "@/lib/models/User";

// 메모리 캐시: { [guildId]: { data, expires } }
const rankingCache: Record<string, { data: any; expires: number }> = {};
const CACHE_TTL = 30 * 1000; // 30초

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // 포인트 기준 상위 50명 랭킹 반환
  const ranking = await User.find({}).sort({ points: -1 }).limit(50).lean();
  return NextResponse.json({ ranking });
} 