import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "ShopItem", required: true },
  guildId: { type: String, required: true },
  purchasedAt: { type: Date, default: Date.now },
  quantity: { type: Number, default: 1 }
});

export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema); 