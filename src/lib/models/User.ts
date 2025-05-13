import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: String,
  avatar: String,
  servers: [String],
  points: { type: Number, default: 0 },
  purchases: [String],
  profileBackground: String,
});

export default mongoose.models.User || mongoose.model("User", UserSchema); 