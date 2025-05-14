import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import { getUserProfile, addPoints } from "@/lib/services/userService";
import { grantXP } from "@/lib/services/levelService";

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const discordId = searchParams.get("discordId") || user.id;
  if (!discordId) {
    return new NextResponse("discordId required", { status: 400 });
  }
  const profile = await getUserProfile(discordId);
  return NextResponse.json({ user: profile });
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { discordId = user.id, points, xp, guildId } = await req.json();
  let profile, level, xpResult;
  if (typeof points === "number") {
    profile = await addPoints(discordId, points);
  }
  if (typeof xp === "number" && guildId) {
    xpResult = await grantXP({
      discordId,
      guildId,
      type: "message",
      baseXP: xp
    });
    if (xpResult.success) {
      level = await getUserProfile(discordId);
    }
  }
  return NextResponse.json({ user: profile, level, xpResult });
} 