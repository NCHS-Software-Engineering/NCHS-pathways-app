"use client";
import React from "react";
import Link from "next/link";
import SideBar from "@/app/components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";

// Importing images
import animalImage from "./images/animal-systems.jpg";
import architectureImage from "./images/architecture-construction.jpg";
import audioVideoImage from "./images/av-technology.jpg";
import healthSciencesImage from "./images/health-sciences.jpg";
import hospitalityImage from "./images/hospitality-tourism.jpg";
import cosmetologyImage from "./images/cosmetology.jpg";
import humanServicesImage from "./images/human-services.jpg";
import educationImage from "./images/education-training.jpg";
import emtImage from "./images/emt.jpg";
import stemImage from "./images/stem.jpg";
import entrepreneurshipImage from "./images/entrepreneurship.jpg";
import financeImage from "./images/finance-accounting.jpg";


import policyImage from "./images/global-domestic-policy.jpg";
import journalismImage from "./images/journalism-broadcasting.jpg";
import transportationImage from "./images/transportation-logistics.jpg";
import marketingImage from "./images/marketing.jpg";
import networkImage from "./images/network-systems.jpg";
import nursingImage from "./images/nursing-assistant.jpg";
import performingArtsImage from "./images/preforming-arts.jpg";
import plantSystemsImage from "./images/plant-systems.jpg";
import programmingImage from "./images/programming-software.jpg";
import visualArtsImage from "./images/visual-arts.jpg";


// Card Component for Pathways
const PathwayCard = ({ title, category, image }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 12px 24px rgba(0, 0, 0, 0.15)"
          : "0 4px 12px rgba(0, 0, 0, 0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          height: "140px",
          borderRadius: "10px",
          backgroundImage: `url(${image.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          marginBottom: "12px",
          transform: isHovered ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.2s ease",
        }}
      />

      <h3>{title}</h3>

      <div className="tag">
        <p>{category}</p>
      </div>
    </div>
  );
};

export default function EndorsementsPage() {
  const { data: session } = useSession();
  return (
    <>
      
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
              Sign out
            </button>
          </div>
        )}
      </header>
      <div className = "container">
        <SideBar />
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
              image={animalImage}
            />

            <PathwayCard
              title="Architecture & Construction"
              category="Construction"
              image={architectureImage}
            />

            <PathwayCard
              title = "Audio/Video Technology"
              category="Arts, Entertainment, and Design"
              image={audioVideoImage}
            />

            <PathwayCard
              title = "Health Sciences"
              category="Healthcare & Human Services"
              image={healthSciencesImage}
            />

            <PathwayCard
              title = "Hospitality & Tourism"
              category="Hospitality, Events, & Tourism"
              image={hospitalityImage}
            />

            <PathwayCard
              title = "Cosmetology"
              category="Human Services"
              image={cosmetologyImage}
            />

            <PathwayCard
              title = "Human Services"
              category="Healthcare & Human Services"
              image={humanServicesImage}
            />

            <PathwayCard
              title = "Education & Training"
              category="Education"
              image={educationImage}
            />

            <PathwayCard
              title = "Emergency Medical Technician (EMT)"
              category="Public Services & Safety"
              image={emtImage}
            />

            <PathwayCard
              title = "Science, Technology, Engineering, and Mathematics (STEM)"
              category="Science, Technology, Engineering, and Mathematics"
              image={stemImage}
            />

            <PathwayCard
              title = "Entrepreneurship"
              category="Management & Entrepreneurship"
              image={entrepreneurshipImage}
            />

            <PathwayCard
              title = "Finance/Accounting"
              category="Financial Services"
              image={financeImage}
            />

            <PathwayCard
              title = "Global & Domestic Policy"
              category="Public Services & Safety"
              image={policyImage}
            />  

            <PathwayCard
              title = "Journalism & Broadcasting"
              category="Arts, Entertainment, and Design"
              image={journalismImage}
            />

            <PathwayCard
              title = "Transportation, Distribution, and Logistics"
              category="Supply Chain & Transportation"
              image={transportationImage}
            />

            <PathwayCard
              title = "Marketing"
              category="Marketing & Sales"
              image={marketingImage}
            />

            <PathwayCard
              title = "Network Systems/Information Support & Services"
              category="Digital Technology"
              image={networkImage}
            />

            <PathwayCard
              title = "Nursing Assistant"
              category="Healthcare & Human Services"
              image={nursingImage}
            />
            
            <PathwayCard
              title = "Preforming Arts"
              category="Arts, Entertainment, and Design"
              image={performingArtsImage}
            />

            <PathwayCard
              title = "Plant Systems"
              category="Agriculture"
              image={plantSystemsImage}
            />
            
            <PathwayCard
              title = "Programming & Software Development"
              category="Digital Technology"
              image={programmingImage}
            />  

            <PathwayCard
              title = "Visual Arts"
              category="Arts, Entertainment, and Design"
              image={visualArtsImage}
            />


          </div>
        </main>
      </div>
    </>
  );
}
