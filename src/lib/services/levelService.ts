import LevelDefault, { LevelDocument, LevelHistory } from "@/lib/models/Level";
import Config from "@/lib/models/Config";
import mongoose from "mongoose";

const Level = LevelDefault;

export async function addXP(discordId: string, guildId: string, amount: number) {
  return await Level.findOneAndUpdate(
    { userId: discordId, guildId },
    { $inc: { xp: amount } },
    { new: true, upsert: true }
  );
}

// XP 지급 정책 적용 XP 지급 함수
type GrantXPParams = {
  discordId: string;
  guildId: string;
  type: "message" | "voice" | "reaction" | "command";
  baseXP: number;
  channelId?: string;
  requireMic?: boolean;
};

// (임시) 쿨타임 체크용 in-memory map (실서비스는 Redis 등 외부 캐시 권장)
const xpCooldownMap: Record<string, number> = {};

// activityXPPolicy 타입 명확화
interface ActivityXPPolicyItem {
  enabled: boolean;
  minXP: number;
  maxXP: number;
  multiplier: number;
  cooldownSec: number;
  dailyCap?: number;
  requireMic?: boolean;
}
interface ActivityXPPolicy {
  message: ActivityXPPolicyItem;
  voice: ActivityXPPolicyItem;
  reaction: ActivityXPPolicyItem;
  command: ActivityXPPolicyItem;
}

// GrantXP 반환 타입 명확화
interface GrantXPResult {
  success: boolean;
  reason?: string;
  xp?: number;
  user?: LevelDocument | null;
}

// ConfigDocument 타입 명확화 (임시)
interface ConfigDocument {
  key: string;
  baseXP?: number;
  multiplier?: number;
  activityXPPolicy?: ActivityXPPolicy;
  // ...필요시 추가 필드...
}

export async function grantXP({ discordId, guildId, type, baseXP, channelId, requireMic }: GrantXPParams): Promise<GrantXPResult> {
  // 1. 정책 조회
  const config = await Config.findOne({ key: `xp:${guildId}` }) as ConfigDocument | null;
  const policy: ActivityXPPolicyItem = config?.activityXPPolicy?.[type] || { enabled: true, minXP: 1, maxXP: 100, multiplier: 1.0, cooldownSec: 60 };
  if (!policy.enabled) {
    return { success: false, reason: "XP 지급 비활성화" };
  }
  // 2. 쿨타임 체크
  const cooldownKey = `${guildId}:${discordId}:${type}` + (channelId ? `:${channelId}` : "");
  const now = Date.now();
  if (policy.cooldownSec > 0 && xpCooldownMap[cooldownKey] && now - xpCooldownMap[cooldownKey] < policy.cooldownSec * 1000) {
    return { success: false, reason: "쿨타임 미충족" };
  }
  // 3. requireMic(voice) 체크
  if (type === "voice" && policy.requireMic && !requireMic) {
    return { success: false, reason: "마이크 미사용시 XP 지급 불가" };
  }
  // 4. XP 계산(최소/최대/배율)
  let xp = Math.round(baseXP * (policy.multiplier ?? 1));
  if (typeof policy.minXP === "number") xp = Math.max(xp, policy.minXP);
  if (typeof policy.maxXP === "number") xp = Math.min(xp, policy.maxXP);
  if (xp <= 0) {
    return { success: false, reason: "XP가 0 이하" };
  }
  // 5. 일일 상한 체크 및 지급량 조정
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const levelDoc: LevelDocument | null = await (Level as mongoose.Model<any>).findOne({ userId: discordId, guildId });
  let todayXP = 0;
  if (levelDoc && Array.isArray(levelDoc.xpHistory)) {
    todayXP = levelDoc.xpHistory
      .filter((h: LevelHistory) => h.date && h.date >= today)
      .reduce((sum: number, h: LevelHistory) => sum + h.amount, 0);
  }
  if (policy.dailyCap > 0 && todayXP >= policy.dailyCap) {
    return { success: false, reason: "일일 XP 상한 도달" };
  }
  if (policy.dailyCap > 0 && todayXP + xp > policy.dailyCap) {
    xp = policy.dailyCap - todayXP;
    if (xp <= 0) {
      return { success: false, reason: "일일 XP 상한 도달" };
    }
  }
  // 6. 지급(addXP) 및 xpHistory 기록
  const updated = await Level.findOneAndUpdate(
    { userId: discordId, guildId },
    {
      $inc: { xp },
      $push: { xpHistory: { date: new Date(), amount: xp } }
    },
    { new: true, upsert: true }
  );
  xpCooldownMap[cooldownKey] = now;
  return { success: true, xp, user: updated };
} 