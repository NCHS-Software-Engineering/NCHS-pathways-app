"use client";

import Link from "next/link";
import SideBar from "../components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AboutPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-(--brand-soft) md:bg-(--bg-primary) text-(--text-primary)">
      
      <div className="flex">
        <div className="flex-1 space-y-8 w-full md:space-y-12">

          {/* PURPOSE SECTION */}
          <section className="bg-(--brand-soft) md:border md:border-(--border-primary) md:rounded-3xl p-6 md:p-8 space-y-8">
            <h2 className="text-2xl font-semibold text-(--brand-text)">Purpose</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                What is the purpose of the Pathways App?
              </h3>

              <div className="bg-(--bg-card) rounded-xl p-5 text-sm leading-relaxed ">
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

              <div className="bg-(--bg-card) rounded-xl p-5 text-sm leading-relaxed ">
                The Pathways App simplifies this process by organizing graduation
                requirements into easy-to-follow pathways, showing students how
                their courses, academic progress, and professional learning
                experiences connect to specific endorsements.
              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section className="bg-(--brand-soft) md:border md:border-(--border-primary) md:rounded-3xl p-6 md:p-8 space-y-8">
            <h2 className="text-2xl font-semibold  text-(--brand-text)">
              About The Pathways App
            </h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Mission Statement
              </h3>

              <div className="bg-(--bg-card) rounded-xl p-5 text-sm leading-relaxed ">
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

              <div className="bg-(--bg-card) rounded-xl p-5 text-sm leading-relaxed ">
                We are a team of students — Cam, Connor Doyle, Dylan, and Trau —
                working together to improve how students understand and navigate
                graduation requirements.
              </div>
            </div>
          </section>

          {/* WHAT ARE PATHWAYS SECTION */}
          <section className="bg-(--brand-soft) md:border md:border-(--border-primary) md:rounded-3xl p-6 md:p-8 space-y-8">
            <h3 className="text-3xl font-semibold  text-(--brand-text)">
              What are pathways?
            </h3>

            <p className="bg-(--bg-card) rounded-xl p-5 text-sm  ">
              Pathway endorsements are a set of academic requirements that give
              students a seal on their diploma, signifying that they studied in
              that field.
            </p>

            <h4 className="text-lg font-semibold">
              How do I get them?
            </h4>

            <div className="bg-(--bg-card) rounded-xl p-5 text-sm ">
              <ul className="list-disc pl-5 space-y-2">
                <li>Classes related to the pathway</li>
                <li>Professional learning experience</li>
                <li>Meeting required Math & English standards</li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}