import mongoose, { Document, Model } from "mongoose";

export interface UserDocument extends Document {
  discordId: string;
  username?: string;
  avatar?: string;
  servers?: string[];
  points: number;
  purchases?: string[];
  profileBackground?: string;
  createdAt?: Date;
}

const UserSchema = new mongoose.Schema<UserDocument>({
  discordId: { type: String, required: true, unique: true },
  username: String,
  avatar: String,
  servers: [String],
  points: { type: Number, default: 0 },
  purchases: [String],
  profileBackground: String,
  createdAt: { type: Date, default: Date.now },
});

const User = (mongoose.models.User as Model<UserDocument>) || mongoose.model<UserDocument>("User", UserSchema);

export default User; 