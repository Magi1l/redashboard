import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/api/auth/[...nextauth]/route";
import Purchase from "@/lib/models/Purchase";
import type { PurchaseDocument } from "@/lib/models/Purchase";
import type { Model } from "mongoose";

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const discordId = (session as CustomSession).user?.id;
  if (!discordId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const PurchaseModel = Purchase as Model<PurchaseDocument>;
  const inventory = await PurchaseModel.find({ userId: discordId }).lean();
  return NextResponse.json({ inventory });
} 