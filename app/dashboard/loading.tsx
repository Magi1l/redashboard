import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4" />
      <div className="text-gray-500">로딩 중입니다...</div>
    </div>
  );
} 