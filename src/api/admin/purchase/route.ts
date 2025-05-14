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
    const userId = searchParams.get("userId");
    if (userId !== null) query.userId = userId;
    const itemId = searchParams.get("itemId");
    if (itemId !== null) query.itemId = itemId;
    const guildId = searchParams.get("guildId");
    if (guildId !== null) query.guildId = guildId;
    const from = searchParams.get("from");
    if (from !== null) query.purchasedAt = { $gte: new Date(from) };
    const to = searchParams.get("to");
    if (to !== null) {
      query.purchasedAt = query.purchasedAt || {};
      query.purchasedAt.$lte = new Date(to);
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
    const purchases = await PurchaseModel.find(query)
      .sort({ purchasedAt: -1 })
      .lean();
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
