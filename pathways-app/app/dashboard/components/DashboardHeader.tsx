"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { GraduationCap } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
  isLoggedIn?: boolean;
}

export function DashboardHeader({ userName = "Student", isLoggedIn = false }: DashboardHeaderProps) {
  return (
    <header className="space-y-2 border-b border-(--border-primary) pb-6">
      <div className="flex items-center gap-3 text-(--modal-accent-text) mb-2">
        <GraduationCap size={28} />
        <span className="font-semibold tracking-wider uppercase text-base">
          Student Portal
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-(--text-primary)">
        Welcome back, {userName}
      </h2>
      <p className="text-(--text-secondary) text-lg max-w-2xl">
        Track your progress toward your high school diploma endorsements. Review
        your action items and pathway requirements below.
      </p>
      
      {!isLoggedIn && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-900 dark:text-blue-100 text-sm md:text-base">
            <span className="font-semibold">Please log in to save your progress.</span> Your data will be saved to your account once you sign in with Google.
          </p>
          <button
            onClick={() => signIn("google")}
            className="mt-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
            aria-label="Sign in button"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </header>
  );
}
