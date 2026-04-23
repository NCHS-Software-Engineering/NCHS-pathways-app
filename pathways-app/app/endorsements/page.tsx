"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";

interface PathwayCardProps {
  pathwayId: string;
  title: string;
  category: string;
  tcd: boolean;
  imageUrl?: string;
  link: string; //in jsons for each pathway, does not need to be hard-coded
  isStarred: boolean;
  onToggle: (pathwayId: string) => void;
}

interface EndorsementPathway {
  id: string;
  title: string;
  category: string;
  tcd: boolean;
  link: string;
  imageFile?: string;
  imagePath?: string;
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
    <div
      onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
      className="relative group bg-(--bg-card) border border-(--border-primary) rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
    >

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

      {imageUrl ? (
        <div
          className="aspect-video w-full rounded-lg bg-cover bg-center mb-3 transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="aspect-video w-full rounded-lg mb-3 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 transition-transform duration-300 group-hover:scale-105" />
      )}

      <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
        {title}
      </h3>

      <div className="flex flex-wrap gap-1.5">
        <div className="px-3 py-1 text-sm rounded-full bg-(--chip-bg) text-(--chip-text)">
          {category}
        </div>
        {tcd ? <div className="px-3 py-1 text-sm rounded-full bg-(--tcd-chip-bg) text-(--tcd-chip-text)">TCD</div> : null}
      </div>
      

    </div>
    //</Link>
  );
};

export default function EndorsementsPage() {
  const { data: session } = useSession();
  const [pathways, setPathways] = React.useState<EndorsementPathway[]>([]);
  const [isLoadingPathways, setIsLoadingPathways] = React.useState(true);
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

  const getPathwayImageUrl = React.useCallback((pathway: EndorsementPathway): string | undefined => {
    const imageFile = typeof pathway.imageFile === "string" ? pathway.imageFile.trim() : "";
    if (imageFile) {
      return `/endorsements/images/${encodeURIComponent(imageFile)}`;
    }

    const imagePath = typeof pathway.imagePath === "string" ? pathway.imagePath.trim() : "";
    if (imagePath) {
      return imagePath;
    }

    if (pathway.id) {
      return `/endorsements/images/${encodeURIComponent(pathway.id)}.jpg`;
    }

    return undefined;
  }, []);

  React.useEffect(() => {
    let mountedRef = true;

    const loadPathways = async () => {
      try {
        const response = await fetch("/api/pathways");
        if (!response.ok) throw new Error("Failed to load endorsements.");

        const data = await response.json();
        if (!mountedRef) return;

        const normalized = (Array.isArray(data) ? data : [])
          .filter((pathway) => pathway && typeof pathway.id === "string")
          .sort((a, b) => String(a.title ?? "").localeCompare(String(b.title ?? "")));

        setPathways(normalized);
      } catch {
        if (!mountedRef) return;
        setPathways([]);
      } finally {
        if (mountedRef) {
          setIsLoadingPathways(false);
        }
      }
    };

    loadPathways();

    return () => {
      mountedRef = false;
    };
  }, []);

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
      if (session?.user?.email) {
      console.log("adding ts");

      fetch("/api/users", {

        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          User_Email: session.user.email,
          Stored_Pathways: starredPathways,
          Pathway_Progress: [],
        }),
      }).catch(() => { });
    }
    }
  }, [starredPathways, mounted]);

  //Prevent rendering before localStorage loads
  if (!mounted || isLoadingPathways) return null;

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
            Click on a pathway card to open Schoolinks&apos;s page for it (you must be logged in).
          </h4>

         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {pathways.map((pathway) => (
              <PathwayCard
                key={pathway.id}
                pathwayId={pathway.id}
                title={pathway.title}
                category={pathway.category}
                tcd={pathway.tcd}
                imageUrl={getPathwayImageUrl(pathway)}
                link={pathway.link || "https://app.schoolinks.com"}
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
