import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import Purchase from "@/lib/models/Purchase";

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const discordId = session.user.id;
  const inventory = await Purchase.find({ userId: discordId }).lean();
  return NextResponse.json({ inventory });
} 