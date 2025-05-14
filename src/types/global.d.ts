// import type mongoose from "mongoose"; // 미사용이므로 삭제

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

export {}; 