import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Level from "@/lib/models/Level";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const guildId = searchParams.get("guildId");
  if (!userId || !guildId) {
    return NextResponse.json({ error: "userId, guildId required" }, { status: 400 });
  }
  const level = await Level.findOne({ userId, guildId }).lean();
  return NextResponse.json(level);
} 