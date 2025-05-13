import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessToken = session.user?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "No Discord access token" }, { status: 400 });
  }
  // Discord API 호출
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const guilds = await res.json();
  // 관리자인 서버만 필터
  const adminGuilds = guilds.filter((g: any) => (g.permissions & 0x8) === 0x8);
  return NextResponse.json({ servers: adminGuilds });
} 