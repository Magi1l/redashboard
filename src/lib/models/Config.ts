import mongoose, { Schema, model, models } from "mongoose";

const RewardSchema = new Schema({
  level: { type: Number, required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const NotificationSchema = new Schema({
  levelUp: { type: Boolean, default: true },
  reward: { type: Boolean, default: true },
  system: { type: Boolean, default: true },
}, { _id: false });

const ActivityXPPolicySchema = new Schema({
  enabled: { type: Boolean, default: true },
  minXP: { type: Number, default: 1 },
  maxXP: { type: Number, default: 100 },
  multiplier: { type: Number, default: 1.0 },
  cooldownSec: { type: Number, default: 60 },
  dailyCap: { type: Number, default: 0 }, // 0이면 무제한, 양수면 일일 상한
  requireMic: { type: Boolean, default: false }, // voice 전용
}, { _id: false });

const ConfigSchema = new Schema({
  key: { type: String, required: true, unique: true },
  baseXP: { type: Number, default: 10 },
  multiplier: { type: Number, default: 1.0 },
  rewards: { type: [RewardSchema], default: [] },
  notifications: { type: NotificationSchema, default: () => ({}) },
  // 추후 다른 설정 필드도 추가 가능
  channelXPSettings: {
    type: [
      new Schema({
        channelId: { type: String, required: true },
        type: { type: String, enum: ["text", "voice"], required: true },
        multiplier: { type: Number, default: 1.0 },
        enabled: { type: Boolean, default: true },
      }, { _id: false })
    ],
    default: []
  },
  voiceXPSettings: {
    type: new Schema({
      multiplier: { type: Number, default: 1.0 },
      requireMic: { type: Boolean, default: false }
    }, { _id: false }),
    default: () => ({ multiplier: 1.0, requireMic: false })
  },
  activityXPPolicy: {
    type: new Schema({
      message: { type: ActivityXPPolicySchema, default: () => ({}) },
      voice: { type: ActivityXPPolicySchema, default: () => ({}) },
      reaction: { type: ActivityXPPolicySchema, default: () => ({}) },
      command: { type: ActivityXPPolicySchema, default: () => ({}) },
    }, { _id: false }),
    default: () => ({})
  },
  roleRewards: {
    type: [
      new Schema({
        level: { type: Number, required: true },
        roleId: { type: String, required: true },
      }, { _id: false })
    ],
    default: []
  },
});

export interface ConfigDocument extends mongoose.Document {
  activityXPPolicy?: {
    message?: any;
    voice?: any;
    reaction?: any;
    command?: any;
  };
  // 필요시 다른 필드도 추가
}

const Config = (models.Config as mongoose.Model<ConfigDocument>) || model<ConfigDocument>("Config", ConfigSchema);
export default Config; 