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
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">Pathways Portal</h1>

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
              Sign Out
            </button>
          </div>
        )}
      </header>

      <div className="container flex">
        {/* Sidebar */}
        <SideBar />

        <main className="flex-1 p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold">My Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Track your progress toward diploma endorsements.
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* TO-DO */}
            <div className="bg-white rounded-xl border p-6 space-y-6">
              <h3 className="font-semibold text-lg">To-Do List</h3>

              <div className="space-y-3">
                <p className="font-medium">Test Scores</p>
                <p className="text-sm text-gray-600">
                  Submit scores to check endorsement eligibility.
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    href="/upload-scores"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
                  >
                    Upload Scores
                  </Link>
                  <span className="text-sm font-medium text-yellow-600">
                    Pending
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="font-medium">Course Requirements</p>
                <div className="flex items-center text-green-600 font-medium">
                  ✓ Completed
                </div>
              </div>
            </div>

            {/* PATHWAYS */}
            <div className="bg-white rounded-xl border p-6 space-y-6">
              <h3 className="font-semibold text-lg">My Pathways</h3>

              <div
                onClick={() => openPathway("STEM Endorsement")}
                className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">STEM Endorsement</h4>
                  <span className="text-green-600 font-semibold">75%</span>
                </div>
              </div>

              <div
                onClick={() => openPathway("Business & Industry")}
                className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Business & Industry</h4>
                  <span className="text-yellow-600 font-semibold">50%</span>
                </div>
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
            className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{pathway} Progress</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <p><strong>Credits:</strong> 18 / 24</p>
            <p><strong>Courses:</strong> Completed</p>
            <p><strong>Test Scores:</strong> Pending</p>

            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-green-500 h-2 rounded-full w-3/4" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
