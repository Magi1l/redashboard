import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { getUserProfile, addPoints } from "@/lib/services/userService";
import { grantXP } from "@/lib/services/levelService";

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const discordId = searchParams.get("discordId");
  if (!discordId) {
    return new NextResponse("discordId required", { status: 400 });
  }
  const user = await getUserProfile(discordId);
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { discordId, points, xp, guildId } = await req.json();
  let user, level, xpResult;
  if (typeof points === "number") {
    user = await addPoints(discordId, points);
  }
  if (typeof xp === "number" && guildId) {
    xpResult = await grantXP({
      discordId,
      guildId,
      type: "message", // 기본값(실제 XP 지급 소스에 따라 조정 가능)
      baseXP: xp
    });
    if (xpResult.success) {
      level = await getUserProfile(discordId);
    }
  }
  return NextResponse.json({ user, level, xpResult });
} 