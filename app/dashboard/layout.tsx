import React from "react";
import Link from "next/link";
import DebugPanel from "./components/DebugPanel";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DebugPanel />
      <nav className="flex flex-col md:flex-row gap-2 md:gap-6 mb-6 px-4 py-2 border-b bg-gray-50">
        <Link href="/dashboard/ranking" className="hover:text-yellow-500 font-semibold">랭킹</Link>
        <Link href="/dashboard/profile" className="hover:text-yellow-500 font-semibold">프로필</Link>
        <Link href="/dashboard/shop" className="hover:text-yellow-500 font-semibold">상점</Link>
        <Link href="/dashboard/levels" className="hover:text-yellow-500 font-semibold">서버별 레벨</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
} 