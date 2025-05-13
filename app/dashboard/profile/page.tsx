import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from "react";

interface UserProfile {
  discordId: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  points: number;
  profileBackground?: string;
  rank?: number;
  stats?: Record<string, number>;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = (session?.user && 'id' in session.user) ? (session.user as { id: string }).id : undefined;
    if (!userId) return;
    setLoading(true);
    fetch(`/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return <div className="p-8 text-center">로그인 후 이용 가능합니다.</div>;
  }

  return (
    <section className="max-w-xl mx-auto p-8" style={profile?.profileBackground ? { backgroundImage: `url(${profile.profileBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
      <h2 className="text-2xl font-bold mb-4">프로필</h2>
      {loading ? (
        <div>로딩 중...</div>
      ) : profile ? (
        <div className="flex flex-col items-center gap-4">
          <img src={profile.avatar} alt="아바타" className="w-24 h-24 rounded-full border" />
          <div className="text-xl font-semibold">{profile.username}</div>
          <div>레벨: {profile.level} / XP: {profile.xp} / 포인트: {profile.points}</div>
          {profile.rank !== undefined && (
            <div className="text-sm text-yellow-600 font-bold">서버 랭크: {profile.rank}위</div>
          )}
          <XPProgressBar xp={profile.xp} level={profile.level} />
          {profile.stats && (
            <div className="w-full max-w-xs mt-4 p-3 bg-white/70 rounded shadow text-sm">
              <div className="font-semibold mb-1">추가 통계</div>
              <ul className="flex flex-wrap gap-3">
                {Object.entries(profile.stats).map(([key, value]) => (
                  <li key={key} className="flex flex-col items-center">
                    <span className="font-bold text-gray-700">{value}</span>
                    <span className="text-gray-500">{key}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>유저 정보를 불러올 수 없습니다.</div>
      )}
    </section>
  );
}

function XPProgressBar({ xp, level }: { xp: number; level: number }) {
  // 임시 공식: 다음 레벨까지 필요한 XP = level * 100 + 100
  const nextLevelXP = level * 100 + 100;
  const percent = Math.min(100, Math.round((xp / nextLevelXP) * 100));
  return (
    <div className="w-full max-w-xs mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span>XP</span>
        <span>{xp} / {nextLevelXP}</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-4 bg-yellow-400 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
} 