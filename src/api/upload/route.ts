import { NextRequest, NextResponse } from "next/server";
import { uploadToVercelBlob } from "../../lib/vercel-blob";
import { getServerUser } from "@/lib/auth/discord";
import { v4 as uuidv4 } from "uuid";

export const runtime = "edge";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || typeof user === "string") {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "허용되지 않는 파일 타입" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "최대 5MB 이하 파일만 업로드 가능" }, { status: 400 });
  }
  const ext = file.name.split('.').pop();
  const filename = `${uuidv4()}_${Date.now()}.${ext}`;
  const result = await uploadToVercelBlob(file, filename);
  if (!result || !result.url) {
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
  return NextResponse.json({ url: result.url });
} 