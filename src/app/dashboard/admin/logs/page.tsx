"use client";
import React, { useEffect, useState } from "react";

interface Metric {
  endpoint: string;
  count: number;
  success: number;
  fail: number;
  avgMs: number;
  lastStatus: number;
  lastError?: string;
}
interface Perf {
  label: string;
  count: number;
  avgMs: number;
  maxMs: number;
  minMs: number;
}

export default function SystemStatusDashboard() {
  const [data, setData] = useState<{
    timestamp: string;
    metrics: Metric[];
    perf: Perf[];
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error("API fetch error");
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10초마다 갱신
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;
  if (error) return <div className="p-8 text-red-500">에러: {error}</div>;
  if (!data) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">시스템 상태 대시보드</h1>
      <div className="mb-6 text-sm text-gray-500">
        마지막 갱신: {new Date(data.timestamp).toLocaleString()}
      </div>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">API 메트릭</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">엔드포인트</th>
                <th className="px-2 py-1 border">호출수</th>
                <th className="px-2 py-1 border">성공</th>
                <th className="px-2 py-1 border">실패</th>
                <th className="px-2 py-1 border">평균응답(ms)</th>
                <th className="px-2 py-1 border">최근상태</th>
                <th className="px-2 py-1 border">최근에러</th>
              </tr>
            </thead>
            <tbody>
              {data.metrics?.map((m: Metric) => (
                <tr key={m.endpoint} className={m.fail > 0 ? "bg-red-50" : ""}>
                  <td className="px-2 py-1 border font-mono">{m.endpoint}</td>
                  <td className="px-2 py-1 border">{m.count}</td>
                  <td className="px-2 py-1 border text-green-700">
                    {m.success}
                  </td>
                  <td className="px-2 py-1 border text-red-600">{m.fail}</td>
                  <td className="px-2 py-1 border">{m.avgMs}</td>
                  <td className="px-2 py-1 border">{m.lastStatus}</td>
                  <td className="px-2 py-1 border text-xs text-red-500">
                    {m.lastError || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">DB/성능 요약</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">구간</th>
                <th className="px-2 py-1 border">호출수</th>
                <th className="px-2 py-1 border">평균(ms)</th>
                <th className="px-2 py-1 border">최대(ms)</th>
                <th className="px-2 py-1 border">최소(ms)</th>
              </tr>
            </thead>
            <tbody>
              {data.perf?.map((p: Perf) => (
                <tr key={p.label}>
                  <td className="px-2 py-1 border font-mono">{p.label}</td>
                  <td className="px-2 py-1 border">{p.count}</td>
                  <td className="px-2 py-1 border">{p.avgMs}</td>
                  <td className="px-2 py-1 border">{p.maxMs}</td>
                  <td className="px-2 py-1 border">{p.minMs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">시스템 상태</h2>
        <div className="p-4 bg-gray-50 rounded border">
          <div>
            <b>상태:</b>{" "}
            {data.status === "ok" ? (
              <span className="text-green-600">정상</span>
            ) : (
              <span className="text-red-600">이상</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
