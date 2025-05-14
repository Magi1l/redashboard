export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";
import type { PurchaseDocument } from "@/lib/models/Purchase";
import type { Model } from "mongoose";
import mongoose from "mongoose";

// Purchase 쿼리 타입 명확화
interface PurchaseQuery {
  userId?: string;
  itemId?: string | mongoose.Types.ObjectId;
  guildId?: string;
  purchasedAt?: { $gte?: Date; $lte?: Date };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query: PurchaseQuery = {};
    if (searchParams.get("userId")) query.userId = searchParams.get("userId");
    if (searchParams.get("itemId")) query.itemId = searchParams.get("itemId");
    if (searchParams.get("guildId")) query.guildId = searchParams.get("guildId");
    if (searchParams.get("from")) query.purchasedAt = { $gte: new Date(searchParams.get("from")!) };
    if (searchParams.get("to")) {
      query.purchasedAt = query.purchasedAt || {};
      query.purchasedAt.$lte = new Date(searchParams.get("to")!);
    }
    // itemId가 있으면 ObjectId로 변환
    if (query.itemId) {
      try {
        query.itemId = new mongoose.Types.ObjectId(query.itemId);
      } catch {
        return NextResponse.json([], { status: 200 });
      }
    }
    const PurchaseModel = Purchase as Model<PurchaseDocument>;
    const purchases = await PurchaseModel.find(query).sort({ purchasedAt: -1 }).lean();
    return NextResponse.json(purchases);
  } catch (error) {
    console.error("[GET /api/admin/purchase]", error);
    return new NextResponse("서버 오류", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { _id } = await req.json();
    const PurchaseModel = Purchase as Model<PurchaseDocument>;
    await PurchaseModel.findByIdAndDelete(_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/purchase]", error);
    return new NextResponse("서버 오류", { status: 500 });
  }
} 