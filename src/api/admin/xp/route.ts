import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import { connectDB } from "@/lib/mongodb";
import UserDefault from "@/lib/models/User";
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

export async function GET() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const users = await UserDefault.find();
  return NextResponse.json({ users });
}

export async function POST() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const { userId, guildId, xp, level } = await (await import('next/server')).NextRequest.prototype.json.call(arguments[0]);
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