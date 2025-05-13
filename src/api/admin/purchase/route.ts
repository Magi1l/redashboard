import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query: any = {};
  if (searchParams.get("userId")) query.userId = searchParams.get("userId");
  if (searchParams.get("itemId")) query.itemId = searchParams.get("itemId");
  if (searchParams.get("guildId")) query.guildId = searchParams.get("guildId");
  if (searchParams.get("from")) query.purchasedAt = { $gte: new Date(searchParams.get("from")!) };
  if (searchParams.get("to")) {
    query.purchasedAt = query.purchasedAt || {};
    query.purchasedAt.$lte = new Date(searchParams.get("to")!);
  }
  const purchases = await Purchase.find(query).sort({ purchasedAt: -1 }).lean();
  return NextResponse.json(purchases);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { _id } = await req.json();
  await Purchase.findByIdAndDelete(_id);
  return NextResponse.json({ success: true });
} 