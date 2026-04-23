"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import SideBar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dbUsername, setDbUsername] = useState<string>("");
  const [dbAvatar, setDbAvatar] = useState<string>("");
  const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHJ4PSIxMDAiIGZpbGw9IiNkMWQ1ZGIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzUiIGZpbGw9IiM5Y2EzYWYiLz4KICA8ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTcwIiByeD0iNTUiIHJ5PSI0MCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4=";

  useEffect(() => {
    const fetchUsername = () => {
      if (!session?.user?.email) return;
      fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data[0]?.Username) setDbUsername(data[0].Username);
          if (data[0]?.Profile_Picture) setDbAvatar(data[0].Profile_Picture);

        })

        .catch(() => { });
    };
    fetchUsername();
    window.addEventListener("usernameUpdated", fetchUsername);
    return () => window.removeEventListener("usernameUpdated", fetchUsername);
  }, [session]);
  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-(--border-primary) bg-(--bg-secondary)">
        <div className="flex items-center gap-3">

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2.5 text-2xl leading-none rounded-lg hover:bg-(--bg-card)"
          >
            ☰
          </button>

          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Pathways Portal
          </h1>
        </div>

        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 h-11 px-3 text-sm md:text-base bg-(--bg-card) text-(--text-primary) border border-(--border-primary) rounded-md hover:bg-(--text-primary) hover:text-(--bg-secondary) transition"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              className="w-4 h-4"
              alt="Google logo"
            />
            <span className="hidden sm:inline">Sign in with Google</span>
            <span className="sm:hidden">Sign in</span>
          </button>
        ) : (
          <div className="flex gap-3">
            <img
              src={dbAvatar || DEFAULT_AVATAR} 
              className="w-9 h-9 rounded-full"
              alt="User avatar"
            />

            <span className="font-medium text-base hidden sm:block self-center">
              {dbUsername || session.user?.name}
            </span>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 h-11 px-3 text-sm md:text-base bg-(--bg-card) text-(--text-primary) border border-(--border-primary) rounded-md hover:bg-(--text-primary) hover:text-(--bg-secondary) transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* MOBILE SIDEBAR */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-50 flex md:hidden">

          {/* dark overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          {/* sidebar */}
          <div className="relative w-72 h-full bg-(--bg-secondary) text-xl">
            <SideBar open={menuOpen} setOpen={setMenuOpen} />
          </div>

        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex min-h-screen pt-14 md:pt-16">
        <div className="hidden md:block md:self-stretch md:sticky md:top-16 md:h-[calc(100vh-4rem)] bg-(--bg-secondary) border-r border-(--border-primary)">
          <SideBar open={menuOpen} setOpen={setMenuOpen} />
        </div>

        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}