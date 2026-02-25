"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideBar() {
  const pathname = usePathname();

  const linkClasses = (path) => {
    const isActive = pathname === path;

    return `
      block px-4 py-2 rounded-lg transition-colors duration-200
      ${
        isActive
          ? "bg-(--brand) text-white font-bold"
          : "text-(--text-primary) hover:bg-(--border-primary) font-bold"
      }
    `;
  };

  return (
    <aside className="w-64 min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] border-r border-[var(--border-primary)] p-6">
      <nav className="flex flex-col gap-3">
        <Link href="/dashboard" className={linkClasses("/dashboard")}>
          Dashboard
        </Link>

        <Link href="/endorsements" className={linkClasses("/endorsements")}>
          Endorsements
        </Link>

        <Link href="/about" className={linkClasses("/about")}>
          About
        </Link>

        <Link href="/settings" className={linkClasses("/settings")}>
          Settings
        </Link>
      </nav>
    </aside>
  );
}