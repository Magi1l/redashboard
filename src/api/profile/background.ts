import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../lib/mongodb";
import UserDefault from "../../lib/models/User";
import type { UserDocument } from "../../lib/models/User";
import { errorResponse } from "../../lib/middleware/errorResponse";

const User = UserDefault as import("mongoose").Model<UserDocument>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json(errorResponse({ code: "BE4050", message: "Method not allowed" }));
  }
  await connectDB();
  const { discordId, bgUrl } = req.body;
  if (!discordId || !bgUrl) {
    return res
      .status(400)
      .json(
        errorResponse({ code: "BE4002", message: "discordId, bgUrl required" }),
      );
  }
  try {
    await User.updateOne(
      { discordId: discordId },
      { $set: { profileBackground: bgUrl } },
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json(errorResponse(err));
  }
}
