"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";
import tinycolor from "tinycolor2";
import Image from "next/image";

interface UserProfile {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  points: number;
  rank: number;
}

// contrast 체크 함수 (ProfileCardPreview에서 사용)
function getContrastWarning(bg: string, fg: string) {
  const ratio = tinycolor.readability(bg, fg);
  if (ratio < 4.5) return "⚠️ 명암 대비가 낮음 (권장: 4.5 이상)";
  return null;
}

const ProfileCardPreview = React.memo(function ProfileCardPreview({
  avatar, username, level, xp, points, rank, borderColor, textColor, xpBarColor, background, previewRef, loading
}: any) {
  // XP 퍼센트 계산 useMemo
  const xpPercent = useMemo(() => (xp % 100), [xp]);
  // contrast 체크 useMemo
  const contrastWarning = useMemo(() => getContrastWarning(background || "#222", textColor), [background, textColor]);

  // skeleton 렌더링
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 animate-pulse bg-gray-100 rounded-2xl p-8 w-full max-w-md h-80">
        <div className="w-24 h-24 rounded-full bg-gray-300 mb-2" />
        <div className="h-6 w-32 bg-gray-300 rounded mb-2" />
        <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
        <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>
    );
  }

  // 키보드 이벤트 useCallback
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.currentTarget.classList.add("ring-4", "ring-yellow-400");
      setTimeout(() => e.currentTarget.classList.remove("ring-4", "ring-yellow-400"), 200);
    }
  }, []);

  return (
    <div
      ref={previewRef}
      className="flex flex-col items-center gap-4 transition-all duration-200 shadow-md hover:shadow-2xl focus-within:ring-4 focus-within:ring-yellow-300 active:scale-95 cursor-pointer outline-none w-full max-w-md mx-auto"
      tabIndex={0}
      style={background ? { backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, padding: 24 } : {}}
      aria-label="프로필 카드 미리보기"
      role="region"
      onKeyDown={handleKeyDown}
    >
      <Image src={avatar} alt="아바타 미리보기" width={96} height={96} className="w-24 h-24 rounded-full border" style={{ borderColor }} loading="lazy" decoding="async" />
      <div className="text-xl font-semibold break-all" style={{ color: textColor }}>{username}</div>
      <div style={{ color: textColor }}>레벨: {level} / XP: {xp} / 포인트: {points}</div>
      <div style={{ color: textColor }}>랭크: {rank}</div>
      {contrastWarning && (
        <div className="text-xs text-red-600">{contrastWarning}</div>
      )}
      <div className="w-full bg-gray-300 rounded h-4 mt-2">
        <div className="h-4 rounded transition-all duration-300" style={{ width: `${xpPercent}%`, background: xpBarColor }} />
      </div>
    </div>
  );
});

export default function ProfileCustomizePage() {
  const { data: session } = useSession();
  const [borderColor, setBorderColor] = useState("#FFD600");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [xpBarColor, setXpBarColor] = useState("#00BFFF");
  const [background, setBackground] = useState<string>("");
  const [previewMode, setPreviewMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const themes = [
    { name: "디스코드", borderColor: "#5865F2", textColor: "#FFFFFF", xpBarColor: "#FFD600" },
    { name: "라이트", borderColor: "#CCCCCC", textColor: "#222222", xpBarColor: "#00BFFF" },
    { name: "핑크", borderColor: "#FF69B4", textColor: "#FF69B4", xpBarColor: "#FFB6C1" },
    { name: "블루", borderColor: "#1E90FF", textColor: "#1E90FF", xpBarColor: "#00BFFF" },
  ];
  function applyTheme(idx: number) {
    setBorderColor(themes[idx].borderColor);
    setTextColor(themes[idx].textColor);
    setXpBarColor(themes[idx].xpBarColor);
  }

  const backgroundPresets = [
    "/bg1.jpg",
    "/bg2.jpg",
    "/bg3.jpg",
    "/bg4.jpg"
  ];

  // 미리보기용 유저 데이터 (실제 데이터 fetch/props로 대체 가능)
  const preview: UserProfile = {
    username: session?.user?.name || "User",
    avatar: session?.user?.image || "/default-avatar.png",
    level: (session?.user as { level?: number })?.level || 1,
    xp: (session?.user as { xp?: number })?.xp || 0,
    points: (session?.user as { points?: number })?.points || 0,
    rank: 1,
  };

  // 기본값(초기화용)
  const defaultState = {
    borderColor: "#FFD600",
    textColor: "#FFFFFF",
    xpBarColor: "#00BFFF",
    background: ""
  };
  function resetAll() {
    setBorderColor(defaultState.borderColor);
    setTextColor(defaultState.textColor);
    setXpBarColor(defaultState.xpBarColor);
    setBackground(defaultState.background);
  }

  // 불러오기: profileBackground
  useEffect(() => {
    const discordId = (session?.user && 'id' in session.user) ? (session.user as { id: string }).id : undefined;
    if (!discordId) return;
    setLoading(true);
    fetch(`/api/profile?discordId=${discordId}&guildId=default`)
      .then(res => res.json())
      .then(data => {
        if (data?.user?.profileBackground) setBackground(data.user.profileBackground);
      })
      .catch(() => setMessage("불러오기 실패"))
      .finally(() => setLoading(false));
  }, [session]);

  // 저장: profileBackground
  async function saveBackground() {
    const discordId = (session?.user && 'id' in session.user) ? (session.user as { id: string }).id : undefined;
    if (!discordId) return setMessage("로그인 필요");
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordId, bgUrl: background })
      });
      if (res.ok) {
        setMessage("저장 완료!");
      } else {
        setMessage("저장 실패");
      }
    } catch {
      setMessage("저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function exportAsImage() {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { backgroundColor: null });
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "profile-card.png";
    link.click();
  }

  return (
    <section className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">프로필 커스터마이즈</h2>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={previewMode} onChange={e => setPreviewMode(e.target.checked)} />
          <span>프리뷰 모드</span>
        </label>
        <button type="button" className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300" onClick={resetAll}>초기화</button>
        <button type="button" className="px-3 py-1 bg-yellow-400 rounded text-sm hover:bg-yellow-500 font-bold" onClick={saveBackground} disabled={saving || loading}>
          {saving ? "저장 중..." : "저장"}
        </button>
        <button type="button" className="px-3 py-1 bg-blue-500 rounded text-sm text-white hover:bg-blue-600 font-bold" onClick={exportAsImage}>
          이미지로 저장
        </button>
        {loading && <span className="text-xs text-gray-500">불러오는 중...</span>}
        {message && <span className="text-xs text-green-700 ml-2">{message}</span>}
      </div>
      {previewMode && (
        <div className="flex flex-col gap-4 mb-6">
          <label className="flex items-center gap-2">
            <span>테마</span>
            <select className="input" onChange={e => applyTheme(Number(e.target.value))}>
              <option value="">테마 선택</option>
              {themes.map((t, i) => <option key={t.name} value={i}>{t.name}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span>텍스트 색상</span>
            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />
          </label>
          <label className="flex items-center gap-2">
            <span>XP 바 색상</span>
            <input type="color" value={xpBarColor} onChange={e => setXpBarColor(e.target.value)} />
          </label>
          <label className="flex flex-col gap-2">
            <span>배경 이미지 선택</span>
            <div className="flex gap-2 mt-1">
              {backgroundPresets.map((bg, i) => (
                <button
                  key={bg}
                  type="button"
                  className={`w-16 h-10 rounded border-2 ${background === bg ? "border-yellow-400" : "border-transparent"}`}
                  style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  onClick={() => setBackground(bg)}
                  aria-label={`배경 ${i+1} 선택`}
                />
              ))}
            </div>
          </label>
        </div>
      )}
      <ProfileCardPreview
        avatar={preview.avatar}
        username={preview.username}
        level={preview.level}
        xp={preview.xp}
        points={preview.points}
        rank={preview.rank}
        borderColor={borderColor}
        textColor={textColor}
        xpBarColor={xpBarColor}
        background={background}
        previewRef={previewRef}
        loading={loading}
      />
    </section>
  );
} 