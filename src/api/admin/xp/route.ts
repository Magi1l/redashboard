import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import { connectDB } from "@/lib/mongodb";
import UserDefault from "@/lib/models/User";
import LevelDefault from "@/lib/models/Level";
import type { LevelDocument } from "@/lib/models/Level";

const Level = LevelDefault as import("mongoose").Model<LevelDocument>;

export async function GET() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const users = await UserDefault.find();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const { userId, guildId, xp, level } = await req.json();
  if (!userId || !guildId) {
    return NextResponse.json(
      { error: "userId, guildId required" },
      { status: 400 },
    );
  }
  const updated = await Level.findOneAndUpdate(
    { userId, guildId },
    { $set: { xp, level } },
    { new: true, upsert: true },
  );
  return NextResponse.json(updated);
}
