import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import type { JwtPayload } from "jsonwebtoken";

export async function GET() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, username, email } = user as JwtPayload;
  return NextResponse.json({ user: { id, username, email } });
} 