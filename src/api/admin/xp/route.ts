import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import LevelDefault from "@/lib/models/Level";
import mongoose from "mongoose";

// Level 타입 명확화
interface LevelDoc extends mongoose.Document {
  userId: string;
  guildId: string;
  level: number;
  xp: number;
}

const Level = LevelDefault as mongoose.Model<LevelDoc>;

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const guildId = searchParams.get("guildId");
  if (!userId || !guildId) {
    return NextResponse.json({ error: "userId, guildId required" }, { status: 400 });
  }
  await connectDB();
  const level = await Level.findOne({ userId, guildId }).lean();
  return NextResponse.json(level);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const { userId, guildId, xp, level } = await req.json();
  if (!userId || !guildId) {
    return NextResponse.json({ error: "userId, guildId required" }, { status: 400 });
  }
  const updated = await Level.findOneAndUpdate(
    { userId, guildId },
    { $set: { xp, level } },
    { new: true, upsert: true }
  );
  return NextResponse.json(updated);
} 