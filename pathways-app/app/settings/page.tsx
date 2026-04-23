"use client";

import { useEffect, useState } from "react";
import SideBar from "../components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  const [dark, setDark] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [gradYear, setGradYear] = useState("2026");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dbUsername, setDbUsername] = useState<string>("");

  async function handleSave() {
    if (!session?.user?.email) return;

    await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        User_Email: session.user.email,
        Username: displayName,
      }),

    });
    if (typeof window !== "undefined") {  
      window.dispatchEvent(new Event("usernameUpdated"));
    }
  }
  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.image) {
        setImagePreview(session.user.image);
      }

      if (session?.user?.email) {
        const res = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
        if (res.ok) {
          const data = await res.json();
          const user = data[0];
          if (user?.Username) {
            setDbUsername(user.Username);
            setDisplayName(user.Username);
          }
        }
      }
    };

    fetchUser();
  }, [session]);
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
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${dark
                  ? "bg-(--brand)"
                  : "bg-(--border-primary)"
                  }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${dark ? "translate-x-7" : ""
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

            {/* Graduation Year */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Graduation Year
              </label>
              <select
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-(--border-primary) bg-(--bg-page)"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-(--brand) text-white hover:opacity-90 transition"
            >
              Save Changes
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}