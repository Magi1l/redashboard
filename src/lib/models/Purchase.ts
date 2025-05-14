import mongoose, { Document, Model } from "mongoose";

export type PurchaseDocument = Document & {
  userId: string;
  itemId: mongoose.Types.ObjectId;
  guildId: string;
  purchasedAt?: Date;
  quantity?: number;
};

const PurchaseSchema = new mongoose.Schema<PurchaseDocument>({
  userId: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "ShopItem", required: true },
  guildId: { type: String, required: true },
  purchasedAt: { type: Date, default: Date.now },
  quantity: { type: Number, default: 1 }
});

const Purchase = (mongoose.models.Purchase as Model<PurchaseDocument>) || mongoose.model<PurchaseDocument>("Purchase", PurchaseSchema);

export default Purchase; 