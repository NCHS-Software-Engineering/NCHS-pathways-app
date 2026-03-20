"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import SideBar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* HEADER */}
      <header className="h-14 flex  justify-between px-6 border-b border-(--border-primary) bg-(--bg-secondary)">
        <div className="flex items-center gap-3">

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-(--bg-card)"
          >
            ☰
          </button>

          <h1 className="text-lg font-semibold">
            Pathways Portal
          </h1>
        </div>

        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="flex items-center mt-2 gap-2 h-9 px-2.5 text-sm bg-(--bg-card) text-(--text-primary) border border-(--border-primary) rounded-md hover:bg-(--text-primary) hover:text-(--bg-secondary) transition"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              className="w-3.5 h-3.5"
              alt="Google logo"
            />
            <span className="hidden sm:inline">Sign in with Google</span>
            <span className="sm:hidden">Sign in</span>
          </button>
        ) : (
          <div className="flex gap-3">
            <img
              src={session.user?.image || "/default-avatar.png"}
              className="w-3.5 h-3.5"
              alt="User avatar"
            />

            <span className="font-medium hidden sm:block">
              {session.user?.name}
            </span>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 h-9 px-2.5 text-sm bg-(--bg-card) text-(--text-primary) border border-(--border-primary) rounded-md hover:bg-(--text-primary) hover:text-(--bg-secondary) transition"
          >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* MOBILE SIDEBAR */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">

            {/* dark overlay */}
            <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
            />

            {/* sidebar */}
            <div className="relative w-64 h-full bg-(--bg-secondary) text-xl">
            <SideBar open={menuOpen} setOpen={setMenuOpen} />
            </div>

        </div>
        )}

      {/* MAIN LAYOUT */}
      <div className="flex">
        <div className="hidden md:block">
          <SideBar open={menuOpen} setOpen={setMenuOpen} />
        </div>

        <main className="flex-1  w-full">
          {children}
        </main>
      </div>
    </>
  );
}