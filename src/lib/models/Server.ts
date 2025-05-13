import mongoose from "mongoose";

const ServerSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  name: String,
  icon: String,
  ownerId: String,
  channels: [String],
  members: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Server || mongoose.model("Server", ServerSchema); 