"use client";

import Link from "next/link";
import SideBar from "../components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AboutPage() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-primary)">
      
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-(--border-primary) bg-(--bg-page)">
        <h1 className="text-lg font-semibold">Pathways Portal</h1>

        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-(--accent-primary) text-white px-4 py-1.5 rounded-md text-sm hover:opacity-90 transition flex items-center gap-2"
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

      <div className="flex">
        <SideBar />

        <main className="flex-1 p-10 space-y-12">

          {/* PURPOSE SECTION */}
          <section className="bg-(--brand) border border-(--border-primary) rounded-3xl p-8 space-y-8">
            <h2 className="text-2xl font-semibold">Purpose</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                What is the purpose of the Pathways App?
              </h3>

              <div className="bg-(--bg-page) rounded-xl p-5 text-sm leading-relaxed border border-(--border-primary)">
                The purpose of the Pathways App is to help students clearly understand,
                track, and achieve pathway endorsement requirements for graduation.
                Many students are unaware of what pathway endorsements are, which ones
                are offered at their school, or what classes and experiences they
                need to complete to earn them.
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                How does it do this?
              </h3>

              <div className="bg-(--bg-page) rounded-xl p-5 text-sm leading-relaxed border border-(--border-primary)">
                The Pathways App simplifies this process by organizing graduation
                requirements into easy-to-follow pathways, showing students how
                their courses, academic progress, and professional learning
                experiences connect to specific endorsements.
              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section className="bg-(--brand) border border-(--border-primary) rounded-3xl p-8 space-y-8">
            <h2 className="text-2xl font-semibold">
              About The Pathways App
            </h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Mission Statement
              </h3>

              <div className="bg-(--bg-page) rounded-xl p-5 text-sm leading-relaxed border border-(--border-primary)">
                Our mission is to create a pathways app that helps students educate
                themselves on the requirements needed to earn specific diploma
                endorsements. We aim to simplify graduation planning by giving
                students clear, accurate, and accessible information.
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                The Pathways Team
              </h3>

              <div className="bg-(--bg-page) rounded-xl p-5 text-sm leading-relaxed border border-(--border-primary)">
                We are a team of students — Cam, C.D., Dylan, and Trau —
                working together to improve how students understand and navigate
                graduation requirements.
              </div>
            </div>
          </section>

          {/* WHAT ARE PATHWAYS SECTION */}
          <section className="bg-(--bg-card) border border-(--border-primary) rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-semibold">
              What are pathways?
            </h3>

            <p className="text-sm">
              Pathway endorsements are a set of academic requirements that give
              students a seal on their diploma, signifying that they studied in
              that field.
            </p>

            <h4 className="text-lg font-semibold">
              How do I get them?
            </h4>

            <div className="bg-(--bg-page) rounded-xl p-5 text-sm border border-(--border-primary)">
              <ul className="list-disc pl-5 space-y-2">
                <li>Classes related to the pathway</li>
                <li>Professional learning experience</li>
                <li>Meeting required Math & English standards</li>
              </ul>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}