import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import Config from "@/lib/models/Config";
import { connectDB } from "@/lib/mongodb";

const CONFIG_KEY = "xp";

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const config = await Config.findOne({ key: CONFIG_KEY });
  return NextResponse.json({
    notifications: config?.notifications ?? { levelUp: true, reward: true, system: true },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const { notifications } = await req.json();
  await Config.findOneAndUpdate(
    { key: CONFIG_KEY },
    { $set: { notifications } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
} 