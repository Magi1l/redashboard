"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface LevelUser {
  discordId: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  points: number;
}

export default function LevelsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<LevelUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/ranking?guildId=default")
      .then((res) => res.json())
      .then((data) => setUsers(data.ranking || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">레벨 랭킹</h2>
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1">순위</th>
              <th className="px-2 py-1">아바타</th>
              <th className="px-2 py-1">유저명</th>
              <th className="px-2 py-1">레벨</th>
              <th className="px-2 py-1">XP</th>
              <th className="px-2 py-1">포인트</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.discordId} className="border-b">
                <td>{idx + 1}</td>
                <td>{user.avatar && <Image src={user.avatar} alt="아바타" width={32} height={32} className="rounded-full" />}</td>
                <td>{user.username}</td>
                <td>{user.level}</td>
                <td>{user.xp}</td>
                <td>{user.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
} 