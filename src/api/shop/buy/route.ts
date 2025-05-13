import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserDefault from "@/lib/models/User";
import ShopItemDefault from "@/lib/models/ShopItem";
import PurchaseDefault from "@/lib/models/Purchase";
import { sendSlackAlert } from "@/lib/monitoring/alert";
import mongoose from "mongoose";

const User = UserDefault as mongoose.Model<any>;
const ShopItem = ShopItemDefault as mongoose.Model<any>;
const Purchase = PurchaseDefault as mongoose.Model<any>;

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await mongoose.startSession();
  let lowStock = false;
  let discordId: string, itemId: string, guildId: string | undefined;
  try {
    const body = await req.json();
    discordId = body.discordId;
    itemId = body.itemId;
    guildId = body.guildId;
    await session.withTransaction(async () => {
      if (!discordId || !itemId) {
        throw new Error("필수 정보 누락");
      }
      // 트랜잭션 내에서 모델 조회
      const user = await User.findOne({ discordId }).session(session);
      const item = await ShopItem.findById(itemId).session(session);
      if (!user || !item) {
        throw new Error("유저 또는 아이템을 찾을 수 없음");
      }
      const alreadyOwned = await Purchase.findOne({ itemId, userId: discordId }).session(session);
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
      const purchase = new Purchase({ userId: discordId, itemId, guildId: guildId || null, quantity: 1 });
      await purchase.save({ session });
    });
    session.endSession();
    // 트랜잭션 성공 후 부수효과(슬랙 알림 등)
    if (lowStock) {
      const item = await ShopItem.findById(itemId);
      const user = await User.findOne({ discordId });
      sendSlackAlert(`상점 재고 임박: ${item?.name} (ID: ${item?._id})\n남은 재고: ${item?.stock}\n구매자: ${user?.username || user?.discordId}`);
    }
    // 트랜잭션 성공 시 포인트 반환
    const user = await User.findOne({ discordId });
    return NextResponse.json({ success: true, points: user?.points });
  } catch (err: any) {
    session.endSession();
    return NextResponse.json({ success: false, error: err.message || "구매 처리 중 오류 발생" }, { status: 500 });
  }
} 