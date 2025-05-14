import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import Config from "@/lib/models/Config";
import { connectDB } from "@/lib/mongodb";
import type { JwtPayload } from "jsonwebtoken";

const CONFIG_KEY = "xp";

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const config = await Config.findOne({ key: CONFIG_KEY });
  return NextResponse.json({
    rewards: config?.rewards ?? [],
  });
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const { rewards } = await req.json();
  await Config.findOneAndUpdate(
    { key: CONFIG_KEY },
    { $set: { rewards } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
} 