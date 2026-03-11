"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import SideBar from "../components/sidebar.jsx";
import { signIn, signOut, useSession } from "next-auth/react";



export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const [pathway, setPathway] = useState("");
  const [starredPathways, setStarredPathways] = React.useState<number[]>([]);

  const { data: session } = useSession();


  //Locale storage loading (remove for database loading)
  React.useEffect(() => {
      const saved = localStorage.getItem("starredPathways");
      if(saved) {
        setStarredPathways(JSON.parse(saved));
      }
    }, []);

  function openPathway(name) {
    setPathway(name);
    setShowModal(true);
  }

  return (
    <>
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-(--border-primary) bg-(--bg-page)">
        <h1 className="text-lg font-semibold">Pathways Portal</h1>

        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-4 py-2 bg-(--bg-card) text-(--text-primary) border rounded-lg shadow hover:bg-(--border-primary) transition"
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
              src={session.user?.image || "/default-avatar.png"}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium">{session.user?.name}</span>

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
              {starredPathways.length === 0 ? (
                <p className="bodyText">No selected pathway endorsements! Select pathways in the "Endorsements" page.</p>
              ) : (
              <div className="space-y-4">
              {starredPathways.map((pathway, index) => (
                <div
                  key={index}
                  onClick={() => openPathway(pathway)}
                  className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="bodyText">{pathway}</h4>
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
              ))}
            </div>  )}
              {/*
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
              </div> */}
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
