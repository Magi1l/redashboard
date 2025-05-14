import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";
import type { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const discordId = (user as JwtPayload).id;
  await connectDB();
  const inventory = await Purchase.find({ userId: discordId }).lean();
  return NextResponse.json({ inventory });
} 