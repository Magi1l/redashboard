import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserDefault from "@/lib/models/User";
import ShopItemDefault from "@/lib/models/ShopItem";
import PurchaseDefault from "@/lib/models/Purchase";
import type { PurchaseDocument } from "@/lib/models/Purchase";
import { sendDiscordAlert } from "@/lib/monitoring/alert";
import mongoose from "mongoose";

// User 타입 명확화
interface UserDoc extends mongoose.Document {
  discordId: string;
  username?: string;
  avatar?: string;
  servers?: string[];
  points: number;
  purchases?: string[];
  profileBackground?: string;
}
// ShopItem 타입 명확화
interface ShopItemDoc extends mongoose.Document {
  name: string;
  description?: string;
  price: number;
  image?: string;
  type: string;
  stock?: number;
  createdAt?: Date;
}

const User = UserDefault as mongoose.Model<UserDoc>;
const ShopItem = ShopItemDefault as mongoose.Model<ShopItemDoc>;
const Purchase = PurchaseDefault as mongoose.Model<PurchaseDocument>;

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await mongoose.startSession();
  let lowStock = false;
  try {
    const body = await req.json();
    await session.withTransaction(async () => {
      if (!body.discordId || !body.itemId) {
        throw new Error("필수 정보 누락");
      }
      // 트랜잭션 내에서 모델 조회
      const user = await User.findOne({ discordId: body.discordId }).session(session);
      const item = await ShopItem.findById(body.itemId).session(session);
      if (!user || !item) {
        throw new Error("유저 또는 아이템을 찾을 수 없음");
      }
      const alreadyOwned = await Purchase.findOne({ itemId: body.itemId, userId: body.discordId }).session(session);
      if (alreadyOwned) {
        throw new Error("이미 소유한 아이템입니다.");
      }
      if (user.points < item.price) {
        throw new Error("포인트가 부족합니다.");
      }
      if (typeof item.stock === "number" && item.stock <= 0) {
        throw new Error("재고가 없습니다.");
      }
      user.points -= item.price;
      await user.save({ session });
      if (typeof item.stock === "number") {
        item.stock -= 1;
        await item.save({ session });
        if (item.stock <= 3) lowStock = true;
      }
      const purchase = new Purchase({ userId: body.discordId, itemId: body.itemId, guildId: body.guildId || null, quantity: 1 });
      await purchase.save({ session });
    });
    session.endSession();
    // 트랜잭션 성공 후 부수효과(슬랙 알림 등)
    if (lowStock) {
      const item = await ShopItem.findById(body.itemId);
      const user = await User.findOne({ discordId: body.discordId });
      sendDiscordAlert(`상점 재고 임박: ${item?.name} (ID: ${item?._id})\n남은 재고: ${item?.stock}\n구매자: ${user?.username || user?.discordId}`);
    }
    // 트랜잭션 성공 시 포인트 반환
    const user = await User.findOne({ discordId: body.discordId });
    return NextResponse.json({ success: true, points: user?.points });
  } catch (err: unknown) {
    let errorMsgText = "알 수 없는 오류";
    if (err instanceof Error) errorMsgText = err.message;
    else if (typeof err === "string") errorMsgText = err;
    session.endSession();
    return NextResponse.json({ success: false, error: errorMsgText || "구매 처리 중 오류 발생" }, { status: 500 });
  }
} 