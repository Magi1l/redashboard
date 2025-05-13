import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Level from "@/lib/models/Level";

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const { discordId } = await req.json();
  await Promise.all([
    User.updateOne({ discordId }, { $set: { points: 0 } }),
    Level.updateMany({ userId: discordId }, { $set: { level: 0, xp: 0 } }),
  ]);
  return NextResponse.json({ ok: true });
} 