"use client";

import { useEffect, useState } from "react";
import SideBar from "../components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  const [dark, setDark] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);

    if (session?.user?.name) {
      setDisplayName(session.user.name);
    }

    if (session?.user?.image) {
      setImagePreview(session.user.image);
    }
  }, [session]);

  function toggleDark() {
    const html = document.documentElement;
    html.classList.toggle("dark");

    const isDark = html.classList.contains("dark");
    setDark(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-primary)">
      
      <div className="flex">

        <main className="flex-1 p-8 space-y-8">
          <h2 className="text-2xl font-semibold">
            Settings
          </h2>

          {/* Appearance */}
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

          {/* Profile Settings */}
          <div className="bg-(--bg-card) border border-(--border-primary) rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold">
              Profile
            </h3>

            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <img
                src={imagePreview || "/default-avatar.png"}
                className="w-20 h-20 rounded-full object-cover border"
                alt="Profile"
              />

              <label className="cursor-pointer px-4 py-2 rounded-md bg-(--brand) text-white text-sm hover:opacity-90 transition">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-(--border-primary) bg-(--bg-page) focus:outline-none focus:ring-2 focus:ring-(--brand)"
              />
            </div>

            <button className="px-4 py-2 rounded-md bg-(--brand) text-white hover:opacity-90 transition">
              Save Changes
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}