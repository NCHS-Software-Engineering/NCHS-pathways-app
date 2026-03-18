"use client";
import React from "react";
import Link from "next/link";
import { StaticImageData } from 'next/image';
import SideBar from "@/app/components/sidebar";
import { signIn, signOut, useSession } from "next-auth/react";
import { Star } from "lucide-react";

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
  pathwayId: string;
  title: string;
  category: string;
  image: StaticImageData;
  isStarred: boolean;
  onToggle: (pathwayId: string) => void;
}

// Card Component for Pathways
const PathwayCard: React.FC<PathwayCardProps> = ({
  pathwayId,
  title,
  category,
  image,
  isStarred,
  onToggle
}) => {
  

  return (
    <div className="relative group bg-(--bg-card) border border-(--border-primary) rounded-xl p-4 w-90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">

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

      <div className="inline-block px-3 py-1 text-sm rounded-full bg-(--border-primary) text-(--text-primary)">
        {category}
      </div>
    </div>
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

      <div className = "container ">
        <SideBar />
        <main className="flex-1 p-8 bg-(--bg-page) text-(--text-primary) min-h-screen">
          <h2 className="text-3xl font-semibold mb-4">Endorsements</h2>

          <p className="text-(--text-primary)/80 max-w-2xl mb-8">
            Explore different career pathways to help you earn endorsements for
            your diploma. Each pathway endorsement guides you toward completing specific
            requirements to gain valuable skills and experience in a chosen field.
          </p>

          <h3 className="text-xl font-semibold mb-6">
            Explore Your Career Pathways
          </h3>

          <div className="flex flex-wrap gap-6">
 
            <PathwayCard
              pathwayId="animal-systems"
              title="Animal Systems"
              category="Agriculture"
              image={animalImage}
              isStarred={starredPathways.includes("animal-systems")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="health-sciences"
              title = "Health Sciences"
              category="Healthcare & Human Services"
              image={healthSciencesImage}
              isStarred={starredPathways.includes("health-sciences")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="cosmetology"
              title = "Cosmetology"
              category="Human Services"
              image={cosmetologyImage}
              isStarred={starredPathways.includes("cosmetology")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="education-training"
              title = "Education & Training"
              category="Education"
              image={educationImage}
              isStarred={starredPathways.includes("education-training")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="emt"
              title = "Emergency Medical Technician (EMT)"
              category="Public Services & Safety"
              image={emtImage}
              isStarred={starredPathways.includes("emt")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="entrepreneurship"
              title = "Entrepreneurship"
              category="Management & Entrepreneurship"
              image={entrepreneurshipImage}
              isStarred={starredPathways.includes("entrepreneurship")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="finance-accounting"
              title = "Finance/Accounting"
              category="Financial Services"
              image={financeImage}
              isStarred={starredPathways.includes("finance-accounting")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="global-domestic-policy"
              title = "Global & Domestic Policy"
              category="Public Services & Safety"
              image={policyImage}
              isStarred={starredPathways.includes("global-domestic-policy")}
              onToggle={toggleStar}
            />  

            <PathwayCard
              pathwayId="marketing"
              title = "Marketing"
              category="Marketing & Sales"
              image={marketingImage}
              isStarred={starredPathways.includes("marketing")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="network-systems-info-services"
              title = "Network Systems/Information Support & Services"
              category="Digital Technology"
              image={networkImage}
              isStarred={starredPathways.includes("network-systems-info-services")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="nursing-assistant"
              title = "Nursing Assistant"
              category="Healthcare & Human Services"
              image={nursingImage}
              isStarred={starredPathways.includes("nursing-assistant")}
              onToggle={toggleStar}
            />

            <PathwayCard
              pathwayId="plant-systems"
              title = "Plant Systems"
              category="Agriculture"
              image={plantSystemsImage}
              isStarred={starredPathways.includes("plant-systems")}
              onToggle={toggleStar}
            />
            
            <PathwayCard
              pathwayId="programming-software-dev"
              title = "Programming & Software Development"
              category="Digital Technology"
              image={programmingImage}
              isStarred={starredPathways.includes("programming-software-dev")}
              onToggle={toggleStar}
            />  


          </div>
        </main>
      </div>
    </>
  );
}
