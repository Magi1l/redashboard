import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import LevelModel from "@/lib/models/Level";
import mongoose from "mongoose";
import type { LevelDocument } from "@/lib/models/Level";
import type { UserDocument } from "@/lib/models/User";

const User = UserModel as mongoose.Model<UserDocument>;
const Level = LevelModel as mongoose.Model<LevelDocument>;

export async function GET() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const users = await User.find(
    {},
    { discordId: 1, username: 1, points: 1, _id: 0 },
  ).lean();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { discordId, guildId, points, level } = await req.json();
  const user = await User.findOneAndUpdate(
    { discordId },
    { $set: { points } },
    { new: true, upsert: true },
  );
  const lvl = await Level.findOneAndUpdate(
    { userId: discordId, guildId },
    { $set: { level } },
    { new: true, upsert: true },
  );
  return NextResponse.json({ user, level: lvl });
}
