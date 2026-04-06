"use client";
import React from "react";
import Link from "next/link";
import { StaticImageData } from 'next/image';
import SideBar from "@/app/components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { pathways } from "../data/pathways";

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

const pathwayImages: Record<string, StaticImageData> = {
  "animal-systems": animalImage,
  "health-sciences": healthSciencesImage,
  "cosmetology": cosmetologyImage,
  "education-training": educationImage,
  "emt": emtImage,
  "entreprenuership": entrepreneurshipImage,
  "finance-accounting": financeImage,
  "global-domestic-policy": policyImage,
  "marketing": marketingImage,
  "network-systems-info-services": networkImage,
  "nursing-assistant": nursingImage,
  "plant-systems": plantSystemsImage,
  "programming-software-dev": programmingImage,
};

interface PathwayCardProps {
  pathwayId: string;
  title: string;
  category: string;
  tcd: boolean;
  image: StaticImageData;
  link: string; //in jsons for each pathway, does not need to be hard-coded
  isStarred: boolean;
  onToggle: (pathwayId: string) => void;
}

// Card Component for Pathways
const PathwayCard: React.FC<PathwayCardProps> = ({
  pathwayId,
  title,
  category,
  tcd,
  image,
  link,
  isStarred,
  onToggle
}) => {

  const router = useRouter();
  
  return (
    //<Link href={link} target="_blank" rel="noopener noreferrer" className="block">
    <div onClick={() => window.open(link)}className="relative group bg-(--bg-card) border border-(--border-primary) rounded-xl p-4 w-90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(pathwayId);
        }}
        className="absolute bottom-5 right-5"
      >
        <Star
          size={35}
          className={`
            transition-colors duration-200
            text-gray-400 hover:text-yellow-600
            ${isStarred ? "fill-yellow-400 text-yellow-500" : "fill-transparent"}
          `}
        />
      </button>

      <div
        className="h-35 rounded-lg bg-cover bg-center mb-3 transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${image.src})` }}
      />

      <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
        {title}
      </h3>

      <div className="inline-block px-3 py-1 text-sm rounded-full bg-(--chip-bg) text-(--chip-text)">
        {category} 
      </div>
    </div>
    //</Link>
  );
};

export default function EndorsementsPage() {
  const { data: session } = useSession();
  //This paragraph can be replaced with const [starredPathways, setStarredPathways] = React.useState<number[]>([]);
  //The rest was used to get past a bug with loading.
  /*
  const [starredPathways, setStarredPathways] = React.useState<string[]>(() => {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem("starredPathways");
  return saved ? JSON.parse(saved) : [];
});*/
  const [starredPathways, setStarredPathways] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);

  //Load from localStorage on mount
  //MOUNT = SOLUTION for loading starred pathways upon refresh AND page changes
  React.useEffect(() => {
    const saved = localStorage.getItem("starredPathways");
    if (saved) {
      setStarredPathways(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  //Save to localStorage when updated
  React.useEffect(() => {
    if (mounted) {
      localStorage.setItem("starredPathways", JSON.stringify(starredPathways));
    }
  }, [starredPathways, mounted]);

  //Prevent rendering before localStorage loads
  if (!mounted) return null;

  const toggleStar = (pathwayId: string) => {
    setStarredPathways((prev) => {
      //If starred, remove
      if (prev.includes(pathwayId)) {return prev.filter((id) => id !== pathwayId);}

      // If max (3), alert
      if (prev.length >= 3) {/*ALERT ABOUT MAX 3 HERE*/
        alert("You can only have up to 3 pathways.");
        return prev;
      }

      //Otherwise, add pathway
      return [...prev, pathwayId];
    });
  };

  return (
    <>
      <div className = "container ">
        <main className="flex-1 p-8 bg-(--bg-page) text-(--text-primary) min-h-screen">
          <h2 className="text-3xl font-semibold mb-4">Endorsements</h2>

          <p className="text-(--text-primary)/80 max-w-2xl mb-8">
            Explore different career pathways to help you earn endorsements for
            your diploma. Each pathway endorsement guides you toward completing specific
            requirements to gain valuable skills and experience in a chosen field.
          </p>

          <h3 className="text-xl font-semibold mb-2">
            Explore Your Career Pathways
          </h3>
          <h4 className="text-(--text-primary)/80 max-w-2xl mb-3">
            Click on a pathway card to open Schoolinks's page for it (you must be logged in).
          </h4>

         <div className="flex flex-wrap gap-6">
            {Object.values(pathways).map((pathway) => (
              <PathwayCard
                key={pathway.id}
                pathwayId={pathway.id}
                title={pathway.title}
                category={pathway.category}
                tcd={pathway.tcd}
                image={pathwayImages[pathway.id]} 
                link={pathway.link}
                isStarred={starredPathways.includes(pathway.id)}
                onToggle={toggleStar}
              />
            ))}
          </div>

        </main>
      </div>
    </>
  );
}
