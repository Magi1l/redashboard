import { NextApiRequest, NextApiResponse } from "next";
import { createCanvas, loadImage } from "canvas";
import { connectDB } from "../lib/mongodb";
import User from "../lib/models/User";
import Level from "../lib/models/Level";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { discordId, guildId } = req.query;
  if (!discordId || !guildId) {
    return res.status(400).json({ error: "discordId, guildId required" });
  }
  await connectDB();
  const user = await User.findOne({ discordId }).lean();
  const levelDoc = await Level.findOne({ userId: discordId, guildId }).lean();
  const level = levelDoc?.level || 1;
  if (!user) return res.status(404).json({ error: "User not found" });

  // Canvas 생성
  const width = 400, height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 배경
  if (user.profileBackground) {
    try {
      const bgImg = await loadImage(user.profileBackground.startsWith("/") ? `https://yourdomain.com${user.profileBackground}` : user.profileBackground);
      ctx.drawImage(bgImg, 0, 0, width, height);
    } catch {
      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, width, height);
  }

  // 아바타
  if (user.avatar) {
    try {
      const avatarImg = await loadImage(user.avatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(60, 60, 40, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, 20, 20, 80, 80);
      ctx.restore();
    } catch {}
  }

  // 닉네임
  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(user.username || "User", 120, 60);

  // 레벨
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#FFD600";
  ctx.fillText(`레벨: ${level}`, 120, 90);

  // 결과 반환
  res.setHeader("Content-Type", "image/png");
  return res.status(200).end(canvas.toBuffer("image/png"));
} 