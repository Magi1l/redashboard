import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI 환경변수가 설정되어 있지 않습니다.");
}

// 글로벌 캐싱은 Next.js의 핫 리로드 환경에서 런타임 안전을 위해 불가피하게 as any 사용
// (실서비스 환경에서는 최소한의 as any만 허용, 타입 명확화가 가능한 경우 반드시 적용)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).mongoose = cached;
  return cached.conn;
} 