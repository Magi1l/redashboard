"use client";
import { useEffect, useState } from "react";

export default function AdminUserPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/user")
      .then((res) => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const handleReset = async (discordId: string) => {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/user/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordId }),
    });
    if (res.ok) setMessage(`유저(${discordId}) 초기화 완료!`);
    else setMessage(`유저(${discordId}) 초기화 실패`);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">유저별 포인트/레벨 초기화</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">디스코드ID</th>
            <th className="p-2">유저명</th>
            <th className="p-2">포인트</th>
            <th className="p-2">초기화</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.discordId} className="border-t">
              <td className="p-2">{u.discordId}</td>
              <td className="p-2">{u.username || "-"}</td>
              <td className="p-2">{u.points ?? 0}</td>
              <td className="p-2">
                <button
                  onClick={() => handleReset(u.discordId)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  disabled={loading}
                >
                  초기화
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {message && <div className="mt-4 text-green-600">{message}</div>}
    </div>
  );
} 