import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import Config from "@/lib/models/Config";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  if (!guildId) {
    return NextResponse.json({ error: "guildId required" }, { status: 400 });
  }
  await connectDB();
  const config = await (Config as any).findOne({ key: `xp:${guildId}` });
  return NextResponse.json({
    baseXP: config?.baseXP ?? 10,
    multiplier: config?.multiplier ?? 1.0,
    channelXPSettings: config?.channelXPSettings ?? [],
    voiceXPSettings: config?.voiceXPSettings ?? { multiplier: 1.0, requireMic: false },
    activityXPSettings: config?.activityXPSettings ?? { message: 1.0, voice: 1.0 },
    activityXPPolicy: config?.activityXPPolicy ?? {},
    roleRewards: config?.roleRewards ?? [],
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const { guildId, baseXP, multiplier, channelXPSettings, voiceXPSettings, activityXPSettings, activityXPPolicy, roleRewards } = await req.json();
  if (!guildId) {
    return NextResponse.json({ error: "guildId required" }, { status: 400 });
  }
  await (Config as any).findOneAndUpdate(
    { key: `xp:${guildId}` },
    { $set: { baseXP, multiplier, channelXPSettings, voiceXPSettings, activityXPSettings, activityXPPolicy, roleRewards } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
} 