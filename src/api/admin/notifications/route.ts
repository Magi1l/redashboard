import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import Config from "@/lib/models/Config";
import { connectDB } from "@/lib/mongodb";

const CONFIG_KEY = "xp";

export async function GET() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const config = await Config.findOne({ key: CONFIG_KEY });
  return NextResponse.json({
    notifications: config?.notifications ?? { levelUp: true, reward: true, system: true },
  });
}

export async function POST() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const { notifications } = await (await import('next/server')).NextRequest.prototype.json.call(arguments[0]);
  await Config.findOneAndUpdate(
    { key: CONFIG_KEY },
    { $set: { notifications } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
} 