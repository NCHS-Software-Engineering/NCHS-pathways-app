"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SideBar from "../components/sidebar";

export default function SettingsPage() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggleDark() {
    const html = document.documentElement;

    html.classList.toggle("dark");

    const isDark = html.classList.contains("dark");

    setDark(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 border-b border-(--border-primary) bg-(--bg-page)">
        <h1 className="text-lg font-semibold">Pathways Portal</h1>
        <Link href="/signin">Sign In</Link>
      </header>

      <div className="flex">
        <SideBar />

        <main className="flex-1 p-8 bg-(--bg-page) text-(--text-primary) min-h-screen">
          <h2 className="text-2xl font-semibold mb-6">Settings</h2>

          <div className="bg-(--bg-card) border border-(--border-primary) rounded-xl p-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">Dark Mode</span>

              <button
                onClick={toggleDark}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  dark
                    ? "bg-(--brand)"
                    : "bg-(--border-primary)"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    dark ? "translate-x-7" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}