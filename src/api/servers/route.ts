import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import type { CustomSession } from "../auth/[...nextauth]/route";

// Discord API 서버 타입 명확화
interface ServerRaw {
  id: string;
  name: string;
  permissions: number;
  icon?: string;
}
interface Server {
  id: string;
  name: string;
  icon?: string;
}

export async function GET() {
  const session = await getServerSession(authOptions) as CustomSession;
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
  const guilds: ServerRaw[] = await res.json();
  // 관리자인 서버만 필터
  const adminGuilds: Server[] = guilds
    .filter((g: ServerRaw) => (g.permissions & 0x8) === 0x8)
    .map((g: ServerRaw) => ({ id: g.id, name: g.name, icon: g.icon }));
  return NextResponse.json({ servers: adminGuilds });
} 