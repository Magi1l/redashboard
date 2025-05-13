import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import mongoose from "mongoose";
import ShopItem from "@/lib/models/ShopItem";
import Purchase from "@/lib/models/Purchase";
import User from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const items = await ShopItem.find({}).lean();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId, itemId, guildId } = await req.json();
  const user = await User.findOne({ discordId: userId });
  const item = await ShopItem.findById(itemId);
  if (!user || !item) {
    return NextResponse.json({ error: "유저 또는 아이템이 존재하지 않습니다." }, { status: 400 });
  }
  if (user.points < item.price) {
    return NextResponse.json({ error: "포인트가 부족합니다." }, { status: 400 });
  }
  if (item.stock <= 0) {
    return NextResponse.json({ error: "재고가 없습니다." }, { status: 400 });
  }
  user.points -= item.price;
  item.stock -= 1;
  await user.save();
  await item.save();
  const purchase = await Purchase.create({ userId, itemId, guildId });
  return NextResponse.json({ purchase });
} 