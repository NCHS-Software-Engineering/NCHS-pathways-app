import React from "react";
import Link from "next/link";
import SideBar from "@/components/SideBar";

// Card Component for Pathways
const PathwayCard = ({ title, category, image }) => (
  <div className="card">
    <div
      style={{
        height: "140px",
        borderRadius: "10px",
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        marginBottom: "12px",
      }}
    />

    <h3>{title}</h3>

    <div className="section">
      <p>{category}</p>
    </div>
  </div>
);

export default function EndorsementsPage() {
  return (
    <>
      <Sidebar />
      <header>
        <h1>Pathways Portal</h1>
        <Link href="/signin">Sign In</Link>
      </header>

      <main style={{ padding: "32px" }}>
        <h2>Pathways</h2>

        <p className="subtitle">
          Explore different career pathways to help you earn endorsements for
          your diploma. Each pathway will guide you towards completing specific
          requirements to gain valuable skills and knowledge in a chosen field.
        </p>

        <h3>Explore Your Career Pathways</h3>

        {/* Example Cards (No Backend Yet) */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <PathwayCard
            title="Animal Systems"
            category="Agriculture"
            image="images/animal-systems.jpg"
          />

          <PathwayCard
            title="Architecture & Construction"
            category="Construction"
            image="images/architecture-construction.jpg"
          />
        </div>
      </main>
    </>
  );
}
