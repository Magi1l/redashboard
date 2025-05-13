"use client";
import React from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-red-600">
      <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
      <div className="mb-2">{error.message}</div>
      <button
        className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
        onClick={() => reset()}
      >
        다시 시도
      </button>
    </div>
  );
} 