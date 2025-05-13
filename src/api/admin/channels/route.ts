import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

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
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
  }
  // Discord API 호출
  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch channels from Discord API" }, { status: 500 });
  }
  const channels = await res.json();
  // 필요한 정보만 추출
  const result = channels.map((ch: any) => ({
    channelId: ch.id,
    name: ch.name,
    type: ch.type === 2 ? "voice" : "text", // Discord API: 2=voice, 0=text 등
  }));
  return NextResponse.json({ channels: result });
} 