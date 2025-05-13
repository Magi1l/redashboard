"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const modules = [
  { name: "XP 설정", path: "/admin/xp" },
  { name: "레벨 보상", path: "/admin/rewards" },
  { name: "알림", path: "/admin/notifications" },
  { name: "데이터 리셋", path: "/admin/reset" },
  // ...추가 모듈
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-gray-900 text-white h-full fixed top-0 left-0 z-20 hidden md:block">
      <nav className="flex flex-col gap-2 p-4">
        {modules.map((mod) => (
          <Link
            key={mod.path}
            href={mod.path}
            className={`p-2 rounded transition-colors duration-150 ${pathname === mod.path ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            {mod.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 