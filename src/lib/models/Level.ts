import mongoose from "mongoose";

const LevelSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastMessage: { type: Date, default: Date.now },
  xpHistory: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true }
    }
  ]
});

LevelSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export default mongoose.models.Level || mongoose.model("Level", LevelSchema); 