"use client";
import { useState } from "react";

export default function AdminResetPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setMessage("");
    setConfirm(false);
    const res = await fetch("/api/admin/reset", { method: "POST" });
    if (res.ok) setMessage("초기화 완료!");
    else setMessage("초기화 실패");
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">데이터 리셋</h1>
      <p className="mb-4">레벨/포인트/랭킹 등 데이터를 안전하게 초기화할 수 있습니다.</p>
      <button
        onClick={() => setConfirm(true)}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        전체 데이터 초기화
      </button>
      {confirm && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <p className="mb-2 text-red-700 font-semibold">정말로 모든 데이터를 초기화하시겠습니까?</p>
          <button
            onClick={handleReset}
            className="bg-red-700 text-white px-3 py-1 rounded mr-2"
            disabled={loading}
          >
            예, 초기화
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="bg-gray-400 text-white px-3 py-1 rounded"
            disabled={loading}
          >
            취소
          </button>
        </div>
      )}
      {message && <div className="mt-4 text-green-600">{message}</div>}
    </div>
  );
} 