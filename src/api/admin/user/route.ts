import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Level from "@/lib/models/Level";
import mongoose from "mongoose";

// User 타입 명확화
interface UserDoc extends mongoose.Document {
  discordId: string;
  username?: string;
  points: number;
}
// Level 타입 명확화
interface LevelDoc extends mongoose.Document {
  userId: string;
  guildId: string;
  level: number;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const users = await (User as mongoose.Model<UserDoc>).find({}, { discordId: 1, username: 1, points: 1, _id: 0 }, undefined).lean();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { discordId, guildId, points, level } = await req.json();
  const user = await (User as mongoose.Model<UserDoc>).findOneAndUpdate(
    { discordId },
    { $set: { points } },
    { new: true, upsert: true }
  );
  const lvl = await (Level as mongoose.Model<LevelDoc>).findOneAndUpdate(
    { userId: discordId, guildId },
    { $set: { level } },
    { new: true, upsert: true }
  );
  return NextResponse.json({ user, level: lvl });
} 