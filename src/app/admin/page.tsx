"use client";
import { useEffect, useState } from "react";

interface RecentUser {
  discordId: string;
  username?: string;
  createdAt?: string | Date;
}

interface KPIData {
  userCount: number;
  totalPoints: number;
  totalLevel: number;
  purchaseCount: number;
  recentUsers: RecentUser[];
}

export default function AdminKPIPage() {
  const [kpi, setKpi] = useState<KPIData | null>(null);

  useEffect(() => {
    fetch("/api/admin/kpi")
      .then((res) => res.json())
      .then(setKpi);
  }, []);

  if (!kpi) return <div>로딩 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">관리자 KPI 대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KPIBox label="전체 유저 수" value={kpi.userCount} />
        <KPIBox label="총 포인트" value={kpi.totalPoints} />
        <KPIBox label="총 레벨" value={kpi.totalLevel} />
        <KPIBox label="상점 거래 수" value={kpi.purchaseCount} />
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">최근 가입/활동 유저</h2>
        <ul>
          {kpi.recentUsers.map((u: RecentUser) => (
            <li key={u.discordId} className="mb-1">
              {u.username || u.discordId} ({u.discordId}) - {u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KPIBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded shadow p-6 flex flex-col items-center">
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
} 