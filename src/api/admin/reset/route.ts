import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Level from "@/lib/models/Level";
import Purchase from "@/lib/models/Purchase";

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
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