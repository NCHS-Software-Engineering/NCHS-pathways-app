"use client";

import { useEffect, useState } from "react";
import SideBar from "../components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const currentYear = new Date().getFullYear();
  const graduationYearOptions = Array.from({ length: 4 }, (_, index) => String(currentYear + index));

  const [dark, setDark] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [gradYear, setGradYear] = useState(String(currentYear));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dbUsername, setDbUsername] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHJ4PSIxMDAiIGZpbGw9IiNkMWQ1ZGIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzUiIGZpbGw9IiM5Y2EzYWYiLz4KICA8ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTcwIiByeD0iNTUiIHJ5PSI0MCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4=";

  async function handleSave() {
    if (!session?.user?.email) {
      setSaveError("Sign in to save profile changes.");
      setSaveMessage(null);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          User_Email: session.user.email,
          Username: displayName,
          Profile_Picture: imagePreview,
        }),
      });

      if (!response.ok) {
        let message = "Could not save your profile changes.";
        try {
          const errorBody = await response.json();
          if (errorBody?.error) {
            message = errorBody.error;
          }
        } catch {
          // Keep generic message if response is not JSON.
        }
        throw new Error(message);
      }

      setSaveMessage("Saved. Your profile was updated.");
      setSaveError(null);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("usernameUpdated"));
      }
    } catch (error) {
      setSaveMessage(null);
      setSaveError(error instanceof Error ? error.message : "Could not save your profile changes.");
    } finally {
      setIsSaving(false);
    }
  }
  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        const res = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
        if (res.ok) {
          const data = await res.json();
          const user = data[0];
          if (user?.Username) {
            setDbUsername(user.Username);
            setDisplayName(user.Username);
          }
          if (user?.Profile_Picture) {
            setImagePreview(user.Profile_Picture);
          } else if (session?.user?.image) {
            setImagePreview(session.user.image);
          }
        }
      }
    };

    fetchUser();
  }, [session]);
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
                src={imagePreview || DEFAULT_AVATAR}
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
                {graduationYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {saveMessage ? (
              <p className="text-sm text-(--status-complete)">{saveMessage}</p>
            ) : null}
            {saveError ? (
              <p className="text-sm text-(--status-warning)">{saveError}</p>
            ) : null}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-md bg-(--brand) text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}