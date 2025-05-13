import User from "@/lib/models/User";
import ShopItem from "@/lib/models/ShopItem";
import Purchase from "@/lib/models/Purchase";

export async function buyItem(discordId: string, itemId: string) {
  const user = await User.findOne({ discordId });
  const item = await ShopItem.findById(itemId);
  if (!user || !item) throw new Error("유저 또는 아이템 없음");
  if (user.points < item.price) throw new Error("포인트 부족");
  const alreadyOwned = await Purchase.findOne({ userId: discordId, itemId });
  if (alreadyOwned) throw new Error("이미 소유한 아이템");
  if (typeof item.stock === "number" && item.stock <= 0) throw new Error("재고 없음");
  user.points -= item.price;
  await user.save();
  if (typeof item.stock === "number") {
    item.stock -= 1;
    await item.save();
  }
  const purchase = new Purchase({ userId: discordId, itemId, quantity: 1 });
  await purchase.save();
  return purchase;
} 