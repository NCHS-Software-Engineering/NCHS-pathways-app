"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";
 
interface EndorsementPathway {
  id: string;
  title: string;
  category: string;
  tcd?: boolean;
  link?: string;
  imageFile?: string;
  imagePath?: string;
}

const FALLBACK_IMAGE = "/images/icon.png";

function resolvePathwayImage(pathway: EndorsementPathway): string {
  if (typeof pathway.imageFile === "string" && pathway.imageFile.trim().length > 0) {
    const fileName = pathway.imageFile.split("/").pop() ?? pathway.imageFile;
    return `/endorsements/images/${fileName}`;
  }

  if (typeof pathway.imagePath === "string" && pathway.imagePath.trim().length > 0) {
    return pathway.imagePath;
  }

  return FALLBACK_IMAGE;
}

interface PathwayCardProps {
  pathwayId: string;
  title: string;
  category: string;
  tcd: boolean;
  imageUrl: string;
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
  imageUrl,
  link,
  isStarred,
  onToggle
}) => {
  
  return (
    //<Link href={link} target="_blank" rel="noopener noreferrer" className="block">
    <div onClick={() => link && window.open(link, "_blank", "noopener,noreferrer")}className="relative group bg-(--bg-card) border border-(--border-primary) rounded-xl p-4 w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">

      <img
        src={imageUrl}
        alt={`${title} pathway`}
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
        className="h-35 w-full rounded-lg object-cover mb-3 transition-transform duration-300 group-hover:scale-105"
      />

      <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
        {title}
      </h3>

      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-1.5">
          <div className="px-3 py-1 text-sm rounded-full bg-(--chip-bg) text-(--chip-text)">
            {category}
          </div>
          {tcd ? <div className="px-3 py-1 text-sm rounded-full bg-(--tcd-chip-bg) text-(--tcd-chip-text)">TCD</div> : null}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(pathwayId);
          }}
          className="shrink-0 self-start"
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
  const [pathways, setPathways] = React.useState<EndorsementPathway[]>([]);
  const [mounted, setMounted] = React.useState(false);

  //Load from localStorage on mount
  //MOUNT = SOLUTION for loading starred pathways upon refresh AND page changes
  React.useEffect(() => {
    const saved = localStorage.getItem("starredPathways");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setStarredPathways(parsed.filter((id): id is string => typeof id === "string"));
        }
      } catch {
        // Ignore malformed localStorage values.
      }
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadPathways = async () => {
      try {
        const response = await fetch("/api/pathways", { cache: "no-store" });
        if (!response.ok) return;

        const data = await response.json();
        const records = Array.isArray(data)
          ? data
          : data && typeof data === "object"
            ? Object.values(data)
            : [];

        const normalized = records.filter(
          (pathway): pathway is EndorsementPathway =>
            !!pathway &&
            typeof pathway === "object" &&
            typeof (pathway as EndorsementPathway).id === "string" &&
            typeof (pathway as EndorsementPathway).title === "string" &&
            typeof (pathway as EndorsementPathway).category === "string"
        );

        if (isMounted) {
          setPathways(normalized);
        }
      } catch {
        // Keep page usable even if pathways fetch fails.
      }
    };

    loadPathways();

    return () => {
      isMounted = false;
    };
  }, []);

  //Save to localStorage when updated
  React.useEffect(() => {
    if (mounted) {
      localStorage.setItem("starredPathways", JSON.stringify(starredPathways));
      if (session?.user?.email) {
      console.log("adding ts");

      fetch("/api/users", {

        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          User_Email: session.user.email,
          Stored_Pathways: starredPathways,
        }),
      }).catch(() => { });
    }
    }
  }, [starredPathways, mounted, session]);

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

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pathways.map((pathway) => (
              <PathwayCard
                key={pathway.id}
                pathwayId={pathway.id}
                title={pathway.title}
                category={pathway.category}
                tcd={Boolean(pathway.tcd)}
                imageUrl={resolvePathwayImage(pathway)}
                link={typeof pathway.link === "string" ? pathway.link : ""}
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