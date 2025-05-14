import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI 환경변수가 설정되어 있지 않습니다.");
}

// 글로벌 타입 선언을 활용해 as any 제거
const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn;
} 