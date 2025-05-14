"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#b00" }}>
      <h1>문제가 발생했습니다.</h1>
      <p>{error?.message || "예상치 못한 오류가 발생했습니다."}</p>
      <button onClick={() => reset()} style={{ marginTop: 20, padding: "8px 24px" }}>
        다시 시도
      </button>
    </div>
  );
} 