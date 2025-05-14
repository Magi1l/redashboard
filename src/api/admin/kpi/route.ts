import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User, { UserDocument } from "@/lib/models/User";
import Level from "@/lib/models/Level";
import Purchase from "@/lib/models/Purchase";

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  await connectDB();
  const UserModel = User as import("mongoose").Model<UserDocument>;
  const [userCount, totalPointsAgg, totalLevelAgg, purchaseCount, recentUsers] = await Promise.all([
    UserModel.countDocuments({}),
    UserModel.aggregate([{ $group: { _id: null, sum: { $sum: "$points" } } }]),
    Level.aggregate([{ $group: { _id: null, sum: { $sum: "$level" } } }]),
    Purchase.countDocuments({}),
    UserModel.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  const totalPoints = totalPointsAgg[0]?.sum ?? 0;
  const totalLevel = totalLevelAgg[0]?.sum ?? 0;
  return NextResponse.json({
    userCount,
    totalPoints,
    totalLevel,
    purchaseCount,
    recentUsers,
  });
} 