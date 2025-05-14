import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Discord API 채널 타입 명확화
interface ChannelRaw {
  id: string;
  name: string;
  type: number;
}
interface Channel {
  channelId: string;
  name: string;
  type: "text" | "voice";
}

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
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
  const channels: ChannelRaw[] = await res.json();
  // 필요한 정보만 추출
  const result: Channel[] = channels.map((ch: ChannelRaw) => ({
    channelId: ch.id,
    name: ch.name,
    type: ch.type === 2 ? "voice" : "text",
  }));
  return NextResponse.json({ channels: result });
} 