"use client";

import { CheckCircle2, Database, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminHeaderProps {
  saveMessage: string;
}

export default function AdminHeader({ saveMessage }: AdminHeaderProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme ? savedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
  }, []);

  function toggleDark() {
    const html = document.documentElement;
    const nextDark = !dark;
    html.classList.toggle("dark", nextDark);

    setDark(nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
  }

  return (
    <header className="bg-(--bg-card) border-b border-(--border-primary) sticky top-0 z-10 shadow-sm">
      <div className="max-w-368 mx-auto px-8 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-(--brand)">
          <Database size={34} />
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary) leading-tight">Database Manager</h1>
            <p className="text-sm text-(--text-secondary) font-medium uppercase tracking-wider">Endorsement System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleDark}
            className={`w-16 h-9 flex items-center rounded-full p-1 transition-colors duration-300 ${
              dark ? "bg-(--brand)" : "bg-(--border-primary)"
            }`}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            <div
              className={`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                dark ? "translate-x-7" : ""
              }`}
            >
              {dark ? <Moon size={14} className="text-slate-700" /> : <Sun size={14} className="text-amber-500" />}
            </div>
          </button>

          {saveMessage && (
            <div className="flex items-center gap-2 text-(--success) bg-(--bg-soft) px-4 py-2 rounded-lg font-medium text-sm border border-(--border-primary) animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={16} /> {saveMessage}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
