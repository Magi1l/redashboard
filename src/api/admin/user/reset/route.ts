import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import { connectDB } from "@/lib/mongodb";
import UserDefault from "@/lib/models/User";
import Level from "@/lib/models/Level";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const { discordId } = await req.json();
  const updated = await UserDefault.findOneAndUpdate(
    { discordId },
    { $set: { points: 0 } },
    { new: true }
  );
  await Promise.all([
    Level.updateMany({ userId: discordId }, { $set: { level: 0, xp: 0 } }),
  ]);
  return NextResponse.json(updated);
} 