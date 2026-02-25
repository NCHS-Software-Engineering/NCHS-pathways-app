"use client";
import React from "react";
import Link from "next/link";
import { StaticImageData } from 'next/image';
import SideBar from "@/app/components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";

// Importing images
import animalImage from "./images/animal-systems.jpg";
import healthSciencesImage from "./images/health-sciences.jpg";
import cosmetologyImage from "./images/cosmetology.jpg";
import educationImage from "./images/education-training.jpg";
import emtImage from "./images/emt.jpg";
import entrepreneurshipImage from "./images/entrepreneurship.jpg";
import financeImage from "./images/finance-accounting.jpg";
import policyImage from "./images/global-domestic-policy.jpg";
import marketingImage from "./images/marketing.jpg";
import networkImage from "./images/network-systems.jpg";
import nursingImage from "./images/nursing-assistant.jpg";
import plantSystemsImage from "./images/plant-systems.jpg";
import programmingImage from "./images/programming-software.jpg";

interface PathwayCardProps {
  title: string;
  category: string;
  image: StaticImageData;
}

// Card Component for Pathways
const PathwayCard: React.FC<PathwayCardProps> = ({ title, category, image }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="group bg-(--bg-card) border border-(--border-primary) rounded-xl p-4 w-90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
      
      <div
        className="h-35 rounded-lg bg-cover bg-center mb-3 transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${image.src})` }}
      />

      <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
        {title}
      </h3>

      <div className="inline-block px-3 py-1 text-sm rounded-full bg-(--border-primary) text-(--text-primary)">
        {category}
      </div>
    </div>
  );
};

export default function EndorsementsPage() {
  const { data: session } = useSession();
  return (
    <>
      
      <header className="h-14 flex items-center justify-between px-6 border-b border-(--border-primary) bg-(--bg-secondary) text-(--text-primary)">
        <h1 className="text-lg font-semibold">
          Pathways Portal
        </h1>

        <Link
          href="/signin"
          className="px-4 py-2 rounded-md bg-(--brand) text-white hover:opacity-90 transition"
        >
          Sign In
        </Link>
      </header>
      <div className = "container ">
        <SideBar />
        <main className="flex-1 p-8 bg-(--bg-page) text-(--text-primary) min-h-screen">
          <h2 className="text-3xl font-semibold mb-4">Pathways</h2>

          <p className="text-(--text-primary)/80 max-w-2xl mb-8">
            Explore different career pathways to help you earn endorsements for
            your diploma. Each pathway guides you toward completing specific
            requirements to gain valuable skills in your chosen field.
          </p>

          <h3 className="text-xl font-semibold mb-6">
            Explore Your Career Pathways
          </h3>

          <div className="flex flex-wrap gap-6">
 
            <PathwayCard
              title="Animal Systems"
              category="Agriculture"
              image={animalImage}
            />

            <PathwayCard
              title = "Health Sciences"
              category="Healthcare & Human Services"
              image={healthSciencesImage}
            />

            <PathwayCard
              title = "Cosmetology"
              category="Human Services"
              image={cosmetologyImage}
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
              title = "Plant Systems"
              category="Agriculture"
              image={plantSystemsImage}
            />
            
            <PathwayCard
              title = "Programming & Software Development"
              category="Digital Technology"
              image={programmingImage}
            />  


          </div>
        </main>
      </div>
    </>
  );
}
