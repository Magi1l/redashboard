import User from "@/lib/models/User";

export async function addPoints(discordId: string, amount: number) {
  return await User.findOneAndUpdate(
    { discordId },
    { $inc: { points: amount } },
    { new: true, upsert: true }
  );
}

export async function getUserProfile(discordId: string) {
  return await User.findOne({ discordId });
} 