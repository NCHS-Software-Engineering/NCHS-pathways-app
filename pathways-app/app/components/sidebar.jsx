"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Award, Info, Settings } from "lucide-react";

export default function SideBar({ open, setOpen }) {
  const pathname = usePathname();

  const linkClasses = (path) => {
    const isActive = pathname === path;

    return `
      flex items-center gap-3 px-3 py-2 rounded-md text-medium font-semibold
      transition-colors duration-200
      ${
        isActive
          ? "bg-(--brand) text-white"
          : "text-(--text-primary) hover:bg-(--bg-soft)"
      }
    `;
  };

  return (
    <>
      {/* Dark overlay (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-screen w-64
          bg-(--bg-secondary)
          border-r border-(--border-primary)
          p-4
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <nav className="flex flex-col gap-2 mt-6">
          <p className="text-xs uppercase text-(--text-secondary) mb-2 px-2">
            Navigation
          </p>

          <Link
            href="/dashboard"
            className={linkClasses("/dashboard")}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/endorsements"
            className={linkClasses("/endorsements")}
            onClick={() => setOpen(false)}
          >
            <Award size={18} />
            Endorsements
          </Link>

          <Link
            href="/about"
            className={linkClasses("/about")}
            onClick={() => setOpen(false)}
          >
            <Info size={18} />
            About
          </Link>

          <Link
            href="/settings"
            className={linkClasses("/settings")}
            onClick={() => setOpen(false)}
          >
            <Settings size={18} />
            Settings
          </Link>
        </nav>
      </aside>
    </>
  );
}