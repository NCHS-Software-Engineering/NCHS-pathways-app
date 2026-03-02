"use client";

import { useState } from "react";
import Link from "next/link";
import SideBar from "../components/sidebar.jsx";
import { signIn, signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const [pathway, setPathway] = useState("");

  const { data: session } = useSession();

  function openPathway(name) {
    setPathway(name);
    setShowModal(true);
  }

  return (
    <>
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-(--border-primary) bg-(--bg-secondary) text-(--text-primary)">
        <h1 className="text-lg font-semibold">
          Pathways Portal
        </h1>

        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="px-4 py-2 rounded-md bg-(--brand) text-white hover:opacity-90 transition flex items-center gap-2"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              className="w-4 h-4"
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

            <span className="font-medium">{session.user?.name}</span>

            <button
              onClick={() => signOut()}
              className="px-3 py-1 bg-(--border-primary) rounded-md hover:opacity-80 transition"
            >
              Sign out
            </button>
          </div>
        )}
      </header>

      <div className="container flex">
        {/* Sidebar */}
        <SideBar />

        <main className="flex-1 p-8 space-y-8">
          <div>
            <h2 className="pageTitle text-2xl font-bold">My Dashboard</h2>
            <p className="text-(--text-secondary) mt-1">
              Track your progress toward diploma endorsements.
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ===== TO-DO ===== */}
            <div className="bg-(--bg-card) rounded-xl border p-6 space-y-6">
              <h3 className="cardTitle text-lg">To-Do List</h3>

              <div className="space-y-3">
                <p className="bodyText">Test Scores</p>
                <p className="bodyText text-sm text-(--text-secondary)">
                  Submit scores to check endorsement eligibility.
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    href="/upload-scores"
                    className="bodyText px-4 py-2 rounded-md bg-(--brand) text-white text-sm"
                  >
                    Upload Scores
                  </Link>
                  <span className="text-sm bodyText text-yellow-600">
                    Pending
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="bodyText">Course Requirements</p>
                <div className="flex items-center text-(--success) bodyText">
                  ✓ Completed
                </div>
              </div>
            </div>

            {/* ===== PATHWAYS ===== */}
            <div className="bg-(--bg-card) rounded-xl border p-6 space-y-6">
              <h3 className="cardTitle text-lg">My Pathways</h3>

              <div
                onClick={() => openPathway("STEM Endorsement")}
                className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="bodyText">STEM Endorsement</h4>
                  <span className="text-(--success) bodyText">75%</span>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-(--success) bodyText">
                    ✓ Required Courses
                  </li>
                  <li className="flex items-center gap-2 text-(--success) bodyText">
                    ✓ Credits Earned
                  </li>
                  <li className="flex items-center gap-2 text-yellow-600 bodyText">
                    ⏳ Test Scores
                  </li>
                </ul>
              </div>

              <div
                onClick={() => openPathway("Business & Industry")}
                className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="bodyText">Business & Industry</h4>
                  <span className="text-yellow-600 font-semibold">50%</span>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-(--success) bodyText">
                    ✓ Required Courses
                  </li>
                  <li className="flex items-center gap-2 text-yellow-600 bodyText">
                    ⏳ Credits Earned
                  </li>
                  <li className="flex items-center gap-2 text-yellow-600 bodyText">
                    ⏳ Test Scores
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-(--bg-card) rounded-xl p-6 w-full max-w-lg space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{pathway} Progress</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-(--text-secondary) hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <p><strong>Credits:</strong> 18 / 24</p>
            <p><strong>Courses:</strong> Completed</p>
            <p><strong>Test Scores:</strong> Pending</p>

            <div className="w-full bg-(--bg-page) h-2 rounded-full">
              <div className="bg-(--success) h-2 rounded-full w-3/4" />
            </div>

            <Link
              href="/upload-scores"
              className="inline-block mt-4 px-4 py-2 rounded-md bg-(--brand) text-white text-sm"
            >
              Upload Missing Scores
            </Link>
          </div>
        </div>
      )}

      {/* ===== PROGRESS MODAL ===== */}

    </>
  );
}
