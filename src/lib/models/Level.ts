import mongoose, { Document, Model } from "mongoose";

export interface LevelHistory {
  date: Date;
  amount: number;
}

export interface LevelDocument extends Document {
  userId: string;
  guildId: string;
  xp: number;
  level: number;
  lastMessage: Date;
  xpHistory: LevelHistory[];
}

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

const LevelModel = (mongoose.models.Level as Model<LevelDocument>) || mongoose.model<LevelDocument>("Level", LevelSchema);

export default LevelModel; 