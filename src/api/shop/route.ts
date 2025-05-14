import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/discord";
import ShopItemDefault from "@/lib/models/ShopItem";
import PurchaseDefault from "@/lib/models/Purchase";
import type { PurchaseDocument } from "@/lib/models/Purchase";
import UserDefault from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

interface ShopItemDoc extends mongoose.Document {
  name: string;
  description?: string;
  price: number;
  image?: string;
  type: string;
  stock?: number;
  createdAt?: Date;
}

interface UserDoc extends mongoose.Document {
  discordId: string;
  username?: string;
  avatar?: string;
  servers?: string[];
  points: number;
  purchases?: string[];
  profileBackground?: string;
}

const ShopItem = ShopItemDefault as mongoose.Model<ShopItemDoc>;
const Purchase = PurchaseDefault as mongoose.Model<PurchaseDocument>;
const User = UserDefault as mongoose.Model<UserDoc>;

export async function GET() {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const items = await ShopItem.find({}).lean();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
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
  if (item.stock !== undefined && item.stock <= 0) {
    return NextResponse.json({ error: "재고가 없습니다." }, { status: 400 });
  }
  user.points -= item.price;
  if (item.stock !== undefined) item.stock -= 1;
  await user.save();
  await item.save();
  const purchase = await Purchase.create({ userId, itemId, guildId });
  return NextResponse.json({ purchase });
} 