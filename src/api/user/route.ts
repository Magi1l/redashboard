import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getUserProfile } from "@/lib/services/userService";

export async function GET(req: NextRequest) {
  const session = await getServerSession(req);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const discordId = session.user.id;
  const user = await getUserProfile(discordId);
  return NextResponse.json({ user });
} 