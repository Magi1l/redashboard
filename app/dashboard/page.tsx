import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">디스코드 레벨 대시보드</h1>
      <nav className="flex flex-col gap-4">
        <Link href="/dashboard/ranking" className="btn">🏆 랭킹</Link>
        <Link href="/dashboard/profile" className="btn">👤 내 프로필</Link>
        <Link href="/dashboard/shop" className="btn">🛒 상점</Link>
        <Link href="/dashboard/levels" className="btn">📈 내 레벨</Link>
      </nav>
    </main>
  );
} 