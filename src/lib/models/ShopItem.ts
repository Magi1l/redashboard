import mongoose, { Document, Model } from "mongoose";

export type ShopItemDocument = Document & {
  name: string;
  description?: string;
  price: number;
  image?: string;
  type: string;
  stock?: number;
  createdAt?: Date;
};

const ShopItemSchema = new mongoose.Schema<ShopItemDocument>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  type: { type: String, required: true },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const ShopItem = (mongoose.models.ShopItem as Model<ShopItemDocument>) || mongoose.model<ShopItemDocument>("ShopItem", ShopItemSchema);

export default ShopItem; 