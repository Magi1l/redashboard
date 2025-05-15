import React from "react";

// 임의의 프로필 카드 데이터
const mockProfile = {
  username: "Magi1l",
  avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
  level: 7,
  background:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
};

function ProfileCard({ user }: { user: typeof mockProfile }) {
  return (
    <div
      style={{
        width: 400,
        height: 250,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        background: `url(${user.background}) center/cover, #222`,
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* 아바타 */}
      <div style={{ position: "absolute", left: 20, top: 20 }}>
        <img
          src={user.avatar}
          alt="avatar"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "4px solid #fff",
            background: "#222",
          }}
        />
      </div>
      {/* 닉네임/레벨 */}
      <div style={{ position: "absolute", left: 120, top: 40, color: "#fff" }}>
        <div style={{ fontWeight: "bold", fontSize: 22 }}>{user.username}</div>
        <div style={{ color: "#FFD600", fontSize: 16, marginTop: 8 }}>
          레벨: {user.level}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  // 로그인 버튼 클릭 시 디스코드 OAuth2 로그인 라우트로 이동
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">Redashboard</h1>
      <p className="mb-6 text-gray-700">
        디스코드 서버 레벨/포인트/프로필카드 관리 올인원 대시보드
      </p>
      {/* 로그인 버튼 */}
      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded mb-8 shadow"
        onClick={handleLogin}
      >
        디스코드로 로그인
      </button>
      {/* 프로필카드 예시 */}
      <div className="mb-8">
        <ProfileCard user={mockProfile} />
      </div>
      {/* 봇 설명 */}
      <section className="max-w-xl bg-white rounded shadow p-6 text-gray-800">
        <h2 className="text-xl font-bold mb-2">Redashboard란?</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            디스코드 서버의 레벨/포인트/프로필카드/상점/랭킹을 한 곳에서 관리
          </li>
          <li>
            커스텀 프로필카드, 서버별 랭킹, 포인트 상점, 레벨 보상 등 다양한
            기능 제공
          </li>
          <li>디스코드 OAuth2 로그인으로 내 서버/내 정보만 안전하게 관리</li>
          <li>오픈소스 기반, 누구나 무료로 사용 가능</li>
        </ul>
      </section>
    </main>
  );
}
