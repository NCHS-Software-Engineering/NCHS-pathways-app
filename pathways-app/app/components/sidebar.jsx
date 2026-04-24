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
      max-h-100%
      
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
          fixed md:sticky top-0 md:top-4 left-0 z-50
          h-screen md:h-[calc(100vh-2rem)] md:overflow-y-auto w-64
          bg-(--bg-secondary) md:bg-transparent
          border-r border-(--border-primary) md:border-r-0
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
            aria-label="Go to Dashboard"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/endorsements"
            className={linkClasses("/endorsements")}
            aria-label="Go to Endorsements"
            onClick={() => setOpen(false)}
          >
            <Award size={18} />
            Endorsements
          </Link>

          <Link
            href="/about"
            className={linkClasses("/about")}
            aria-label="Go to About"
            onClick={() => setOpen(false)}
          >
            <Info size={18} />
            About
          </Link>

          <Link
            href="/settings"
            className={linkClasses("/settings")}
            aria-label="Go to Settings"
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