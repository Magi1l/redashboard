"use client";
import { useEffect, useState } from "react";

// 알림 설정 타입 명확화
interface NotificationSettings {
  levelUp: boolean;
  reward: boolean;
  system: boolean;
}

const defaultNotifications: NotificationSettings = {
  levelUp: true,
  reward: true,
  system: true,
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 기존 설정 불러오기
  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications({ ...defaultNotifications, ...data.notifications }))
      .finally(() => setLoading(false));
  }, []);

  // 저장
  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications }),
    });
    if (res.ok) setMessage("저장 완료!");
    else setMessage("저장 실패");
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">알림 설정</h1>
      <div className="mb-4 flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notifications.levelUp}
            onChange={(e) => setNotifications((n) => ({ ...n, levelUp: e.target.checked }))}
          />
          레벨업 알림
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notifications.reward}
            onChange={(e) => setNotifications((n) => ({ ...n, reward: e.target.checked }))}
          />
          보상 알림
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notifications.system}
            onChange={(e) => setNotifications((n) => ({ ...n, system: e.target.checked }))}
          />
          시스템 알림
        </label>
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        저장
      </button>
      {message && <div className="mt-2 text-green-600">{message}</div>}
    </div>
  );
} 