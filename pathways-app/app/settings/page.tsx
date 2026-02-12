"use client";

import Link from "next/link";
import SideBar from "../components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
    const { data: session } = useSession();
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-6 border-b bg-white">
                <h1 className="font-semibold text-lg">Pathways Portal</h1>
                {!session ? (
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow hover:bg-gray-100 transition"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={session.user?.image || ""}
              className="w-8 h-8 rounded-full"
            />

            <span className="font-medium">
              {session.user?.name}
            </span>

            <button
              onClick={() => signOut()}
              className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Sign out
            </button>
          </div>
        )}
            </header>

            {/* Page layout */}
            <div className="flex">
                {/* Sidebar */}
                <SideBar />

                {/* Main content */}
                <main className="flex-1 p-10">
                    <div className="max-w bg-blue-100 rounded-3xl p-8 space-y-8">
                        {/* Title */}
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">
                                Settings
                            </h2>
                        </div>

                        {/* Placeholder content */}
                        <div>
                            <h3 className="text-blue-800 font-semibold mb-3">
                                User Settings
                            </h3>
                            <div className="bg-white rounded-xl p-5 text-sm leading-relaxed">
                                This is the settings page. Configure your preferences here.
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}