import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShopItem from "@/lib/models/ShopItem";

export async function GET() {
  await connectDB();
  const items = await ShopItem.find({}).lean();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const data = await req.json();
  const item = await ShopItem.create(data);
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const data = await req.json();
  const { _id, ...update } = data;
  const item = await ShopItem.findByIdAndUpdate(_id, update, { new: true });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { _id } = await req.json();
  await ShopItem.findByIdAndDelete(_id);
  return NextResponse.json({ success: true });
} 