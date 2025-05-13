import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Level from "@/lib/models/Level";
import Purchase from "@/lib/models/Purchase";

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Level.deleteMany({}),
    Purchase.deleteMany({}),
  ]);
  return NextResponse.json({ ok: true });
} 