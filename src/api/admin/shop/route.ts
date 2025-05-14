import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShopItem from "@/lib/models/ShopItem";
import type { ShopItemDocument } from "@/lib/models/ShopItem";
import type { Model } from "mongoose";

export async function GET() {
  await connectDB();
  const ShopItemModel = ShopItem as Model<ShopItemDocument>;
  const items = await ShopItemModel.find({}).lean();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const data = await req.json();
  const ShopItemModel = ShopItem as Model<ShopItemDocument>;
  const item = await ShopItemModel.create(data);
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const data = await req.json();
  const { _id, ...update } = data;
  const ShopItemModel = ShopItem as Model<ShopItemDocument>;
  const item = await ShopItemModel.findByIdAndUpdate(_id, update, { new: true });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { _id } = await req.json();
  const ShopItemModel = ShopItem as Model<ShopItemDocument>;
  await ShopItemModel.findByIdAndDelete(_id);
  return NextResponse.json({ success: true });
} 