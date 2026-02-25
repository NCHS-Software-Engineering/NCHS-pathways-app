"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SideBar from "../components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
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
    <div className="min-h-screen bg-(--bg-page) text-(--text-primary)">
      
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-(--border-primary) bg-(--bg-card)">
        <h1 className="text-lg font-semibold">
          Pathways Portal
        </h1>

        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-4 py-2 bg-(--bg-card) text-(--text-primary) border rounded-lg shadow hover:bg-gray-100 transition"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              className="w-5 h-5"
              alt="Google logo"
            />
            Sign in with Google
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={session.user?.image || "/default-avatar.png"}
              className="w-8 h-8 rounded-full"
              alt="User avatar"
            />

            <span className="font-medium">
              {session.user?.name}
            </span>

            <button
              onClick={() => signOut()}
              className="px-3 py-1 bg-(--border-primary) rounded-md hover:opacity-80 transition"
            >
              Sign out
            </button>
          </div>
        )}
      </header>

      {/* Layout */}
      <div className="flex">
        <SideBar />

        <main className="flex-1 p-8 min-h-screen">
          <h2 className="text-2xl font-semibold mb-6">
            Settings
          </h2>

          <div className="bg-(--bg-card) border border-(--border-primary) rounded-xl p-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Dark Mode
              </span>

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
    </div>
  );
}