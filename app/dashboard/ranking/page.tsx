"use client";
import React from "react";
import { useEffect, useState } from "react";

interface Level {
  userId: string;
  xp: number;
  level: number;
}
interface User {
  discordId: string;
  username: string;
  avatar?: string;
}

function ProfileCard({ user, level, xp, rank }: { user: User; level: number; xp: number; rank: number }) {
  // 간단한 XP Progress Bar (예시: 다음 레벨까지 1000xp 기준)
  const xpForNext = 1000;
  const progress = Math.min((xp % xpForNext) / xpForNext, 1);
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow mb-2">
      <img
        src={user.avatar || "/default-avatar.png"}
        alt="아바타"
        className="w-12 h-12 rounded-full border"
      />
      <div className="flex-1">
        <div className="font-bold text-lg">{user.username}</div>
        <div className="text-sm text-gray-500">레벨 {level} / XP {xp}</div>
        <div className="w-full h-2 bg-gray-200 rounded mt-1">
          <div className="h-2 bg-yellow-400 rounded" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-400">#{rank}</div>
    </div>
  );
}

export default function RankingPage() {
  const [guildId, setGuildId] = useState("");
  const [ranking, setRanking] = useState<Level[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  // 페이지네이션/검색/필터 상태
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [minLevel, setMinLevel] = useState("");
  const [maxLevel, setMaxLevel] = useState("");
  const pageSize = 10;

  // 데이터 fetch 함수 분리
  const fetchRanking = async (guildId: string) => {
    const res = await fetch(`/api/ranking?guildId=${guildId}`);
    const levels: Level[] = await res.json();
    setRanking(levels);
    // 유저 정보 병렬 fetch
    const ids = levels.map(l => l.userId);
    const userMap: Record<string, User> = {};
    await Promise.all(ids.map(async id => {
      const res = await fetch(`/api/profile?discordId=${id}&guildId=${guildId}`);
      const data = await res.json();
      if (data.user) userMap[id] = data.user;
    }));
    setUsers(userMap);
  };

  useEffect(() => {
    if (!guildId) return;
    fetchRanking(guildId);
    // 30초마다 polling
    const interval = setInterval(() => {
      fetchRanking(guildId);
    }, 30000);
    return () => clearInterval(interval);
  }, [guildId]);

  // 상위 3명 추출
  const podium = ranking.slice(0, 3);
  let rest = ranking.slice(3);

  // 검색/필터 적용
  rest = rest.filter(r => {
    const user = users[r.userId];
    if (search && user && !user.username?.toLowerCase().includes(search.toLowerCase())) return false;
    if (minLevel && r.level < Number(minLevel)) return false;
    if (maxLevel && r.level > Number(maxLevel)) return false;
    return true;
  });

  // 페이지네이션
  const totalPages = Math.ceil(rest.length / pageSize) || 1;
  const paged = rest.slice((page - 1) * pageSize, page * pageSize);

  // 페이지 변경 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-4">서버별 XP/레벨 랭킹</h2>
      <input
        className="input mb-2"
        placeholder="서버 ID 입력"
        value={guildId}
        onChange={e => { setGuildId(e.target.value); setPage(1); }}
      />
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          className="input flex-1"
          placeholder="유저명 검색"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <input
          className="input w-24"
          type="number"
          min={1}
          placeholder="최소 레벨"
          value={minLevel}
          onChange={e => { setMinLevel(e.target.value); setPage(1); }}
        />
        <input
          className="input w-24"
          type="number"
          min={1}
          placeholder="최대 레벨"
          value={maxLevel}
          onChange={e => { setMaxLevel(e.target.value); setPage(1); }}
        />
      </div>
      {/* 시상대(포디움) */}
      {podium.length > 0 && (
        <div className="flex justify-center items-end gap-2 mb-8">
          {/* 2위 */}
          {podium[1] && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-300 bg-white flex items-center justify-center mb-2">
                <img src={users[podium[1].userId]?.avatar || "/default-avatar.png"} alt="2위" className="w-16 h-16 md:w-20 md:h-20 rounded-full" />
              </div>
              <div className="font-semibold text-gray-600">{users[podium[1].userId]?.username || podium[1].userId}</div>
              <div className="text-sm text-gray-400">레벨 {podium[1].level}</div>
              <div className="bg-gray-200 w-12 h-4 flex items-end justify-center rounded-t">2위</div>
            </div>
          )}
          {/* 1위 */}
          {podium[0] && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center mb-2 shadow-lg">
                <img src={users[podium[0].userId]?.avatar || "/default-avatar.png"} alt="1위" className="w-20 h-20 md:w-28 md:h-28 rounded-full" />
              </div>
              <div className="font-bold text-yellow-600">{users[podium[0].userId]?.username || podium[0].userId}</div>
              <div className="text-sm text-gray-500">레벨 {podium[0].level}</div>
              <div className="bg-yellow-400 w-16 h-6 flex items-end justify-center rounded-t font-bold">1위</div>
            </div>
          )}
          {/* 3위 */}
          {podium[2] && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-400 bg-white flex items-center justify-center mb-2">
                <img src={users[podium[2].userId]?.avatar || "/default-avatar.png"} alt="3위" className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
              </div>
              <div className="font-semibold text-gray-600">{users[podium[2].userId]?.username || podium[2].userId}</div>
              <div className="text-sm text-gray-400">레벨 {podium[2].level}</div>
              <div className="bg-yellow-800 w-10 h-3 flex items-end justify-center rounded-t text-white">3위</div>
            </div>
          )}
        </div>
      )}
      {/* 4위 이하 프로필카드 */}
      <div>
        {paged.map((r, i) => (
          <ProfileCard
            key={r.userId}
            user={users[r.userId] || { discordId: r.userId, username: r.userId }}
            level={r.level}
            xp={r.xp}
            rank={(page - 1) * pageSize + i + 4}
          />
        ))}
      </div>
      {/* 페이지네이션 */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >이전</button>
        <span className="px-2">{page} / {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >다음</button>
      </div>
    </main>
  );
} 