import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/services/userService";
import { getServerUser } from "@/lib/auth/discord";
import type { JwtPayload } from "jsonwebtoken";

export async function GET() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const discordId = (user as JwtPayload).id;
  const userProfile = await getUserProfile(discordId);
  return NextResponse.json({ user: userProfile });
} 