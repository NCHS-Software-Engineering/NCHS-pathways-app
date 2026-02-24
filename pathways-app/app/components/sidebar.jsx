"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideBar() {
  const pathname = usePathname();

  const linkClasses = (path) => {

    const isActive = pathname === path;

    return `
      block px-4 py-2 rounded-lg transition-all duration-200
      ${isActive 
        ? "bg-(--accent-primary) text-white font-semibold"
        : "text-(--text-primary) hover:bg-(--border-primary)"
      }
    `;
  };

  return (
    <aside className="w-64 min-h-screen bg-(--bg-card) border-r border-(--border-primary) p-6">
      <nav className="flex flex-col gap-3">
        <Link className={linkClasses("/dashboard")} href="/dashboard">
          Dashboard
        </Link>

        <Link className={linkClasses("/endorsements")} href="/endorsements">
          Endorsements
        </Link>

        <Link className={linkClasses("/about")} href="/about">
          About
        </Link>

        <Link className={linkClasses("/settings")} href="/settings">
          Settings
        </Link>

      </nav>
    </aside>
  );
}