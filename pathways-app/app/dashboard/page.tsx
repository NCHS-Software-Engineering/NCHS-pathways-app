"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import academicSuccessData from "../data/pathways/academic-success.json";

import { DashboardHeader } from "./components/DashboardHeader";
import { QuickStats } from "./components/QuickStats";
import { PathwaysList } from "./components/PathwaysList";
import { ActionItems } from "./components/ActionItems";
import { PathwayDetailsModal } from "./components/PathwayDetailsModal";

import { Pathway, AcademicStatus } from "./types";
import {
  STARRED_PATHWAYS_STORAGE_KEY,
  PATHWAY_PROGRESS_STORAGE_KEY,
  ACADEMIC_STATUS_STORAGE_KEY,
  getPathwayStats,
} from "./utils";

type PathwayRecord = Record<string, Pathway>;

function parsePathwayProgress(rawProgress: unknown): string[] {
  if (Array.isArray(rawProgress)) {
    return rawProgress.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof rawProgress === "string") {
    return rawProgress
      .split(/[;,]/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
}

export default function Dashboard() {
  const [pathways, setPathways] = useState<PathwayRecord>({});
  const [isLoadingPathways, setIsLoadingPathways] = useState(true);
  const [pathwaysLoadError, setPathwaysLoadError] = useState("");
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus>({
    reading: false,
    math: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [activePathway, setActivePathway] = useState<Pathway | null>(null);
  const [activePathwayKey, setActivePathwayKey] = useState<string | null>(null);
  const [starredPathways, setStarredPathways] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    let mountedRef = true;

    async function loadPathways() {
      try {
        const response = await fetch("/api/pathways");
        if (!response.ok) {
          throw new Error("Failed to load pathways.");
        }

        const data = await response.json();
        if (!mountedRef) return;

        const pathwayEntries = (Array.isArray(data) ? data : [])
          .filter((pathway): pathway is Pathway => {
            return (
              pathway !== null &&
              typeof pathway === "object" &&
              typeof (pathway as Pathway).id === "string" &&
              (pathway as Pathway).id.trim().length > 0
            );
          })
          .sort((a, b) => String(a.title ?? "").localeCompare(String(b.title ?? "")))
          .map((pathway) => [pathway.id, pathway] as const);

        setPathways(Object.fromEntries(pathwayEntries));
        setPathwaysLoadError("");
      } catch {
        if (!mountedRef) return;
        setPathways({});
        setPathwaysLoadError("Could not load pathways. Please refresh and try again.");
      } finally {
        if (mountedRef) {
          setIsLoadingPathways(false);
        }
      }
    }

    loadPathways();

    return () => {
      mountedRef = false;
    };
  }, []);

  const pathwayKeyById = useMemo(() => {
    const keyMap = Object.entries(pathways).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[key] = key;
        if (value && typeof value === "object" && "id" in value) {
          const id = (value as { id?: unknown }).id;
          if (typeof id === "string") {
            acc[id] = key;
          }
        }
        return acc;
      },
      {}
    );

    // Backward compatibility for the historical id typo.
    if (keyMap.entrepreneurship && !keyMap.entreprenuership) {
      keyMap.entreprenuership = keyMap.entrepreneurship;
    }
    if (keyMap.entreprenuership && !keyMap.entrepreneurship) {
      keyMap.entrepreneurship = keyMap.entreprenuership;
    }

    return keyMap;
  }, [pathways]);

  const normalizePathwayKey = useCallback(
    (keyOrId: string): string | null => pathwayKeyById[keyOrId] ?? null,
    [pathwayKeyById]
  );

  // Load from localStorage on mount
  useEffect(() => {
    if (isLoadingPathways) return;

    async function loadData() {
      // Inline normalization to avoid stale closure issues
      const normalizeKey = (keyOrId: string): string | null => pathwayKeyById[keyOrId] ?? null;

      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
          if (res.ok) {

            const data = await res.json();
            const user = data[0];
            if (user && Array.isArray(user.Stored_Pathways)) {
              const validPathways = Array.from(
                new Set(
                  user.Stored_Pathways
                    .filter((key: unknown): key is string => typeof key === "string")
                    .map((key: string) => normalizeKey(key))
                    .filter((key: string | null): key is string => key !== null)
                )
              ) as string[];

              localStorage.setItem(STARRED_PATHWAYS_STORAGE_KEY, JSON.stringify(validPathways));
              setStarredPathways(validPathways);
            }
            const progressCourses = parsePathwayProgress(user?.Pathway_Progress);
            if (progressCourses.length > 0) {
              const completedCourses = new Set<string>(progressCourses);

              const updatedPathways = Object.fromEntries(
                Object.entries(pathways).map(([key, pathway]) => [
                  key,
                  {
                    ...pathway,
                    requirements: {
                      ...pathway.requirements,
                      courseCredits: {
                        ...pathway.requirements.courseCredits,
                        requiredCourses: pathway.requirements.courseCredits.requiredCourses.map(c => ({
                          ...c,
                          completed: c.name ? completedCourses.has(c.name) : false,
                        })),
                        electiveCourseOptions: pathway.requirements.courseCredits.electiveCourseOptions.map(c => ({
                          ...c,
                          completed: c.name ? completedCourses.has(c.name) : false,
                        })),
                      },
                    },
                  },
                ])
              ) as PathwayRecord;

              setPathways(updatedPathways);
              localStorage.setItem(PATHWAY_PROGRESS_STORAGE_KEY, JSON.stringify(updatedPathways));
            }
          }

        } catch {
          // ignore
        } finally {
          setIsHydrated(true);
        }
        return;
      }

      // Not signed in — load from localStorage as before
      try {
        const savedStarred = localStorage.getItem(STARRED_PATHWAYS_STORAGE_KEY);
        const savedProgress = localStorage.getItem(PATHWAY_PROGRESS_STORAGE_KEY);
        const savedAcademicStatus = localStorage.getItem(ACADEMIC_STATUS_STORAGE_KEY);

        if (savedStarred) {
          const parsed = JSON.parse(savedStarred);
          if (Array.isArray(parsed)) {
            const validPathways = Array.from(
              new Set(
                parsed
                  .filter((key): key is string => typeof key === "string")
                  .map((key) => normalizeKey(key))
                  .filter((key): key is string => key !== null)
              )
            );
              setStarredPathways(validPathways as string[]);
          }
        }

        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          if (parsedProgress && typeof parsedProgress === "object") {
            const validProgressEntries = Object.entries(parsedProgress)
              .map(([key, value]) => [normalizeKey(key), value] as const)
              .filter(
                (entry): entry is readonly [string, Record<string, unknown>] =>
                  entry[0] !== null &&
                  entry[1] !== null &&
                  typeof entry[1] === "object"
              );
            if (validProgressEntries.length > 0) {
              setPathways((prevPathways) => ({
                ...prevPathways,
                ...Object.fromEntries(validProgressEntries),
              }));
            }
          }
        }

        if (savedAcademicStatus) {
          const parsedAcademicStatus = JSON.parse(savedAcademicStatus);
          if (parsedAcademicStatus && typeof parsedAcademicStatus === "object") {
            setAcademicStatus({
              reading: !!parsedAcademicStatus.reading,
              math: !!parsedAcademicStatus.math,
            });
          }
        }
      } catch {
        // Ignore invalid localStorage values
      } finally {
        setIsHydrated(true);
      }
    }

    loadData();
  }, [session, isLoadingPathways]);

  // Save to localStorage whenever state changes
  useEffect(() => {

    if (!isHydrated) return;

    localStorage.setItem(PATHWAY_PROGRESS_STORAGE_KEY, JSON.stringify(pathways));
    localStorage.setItem(STARRED_PATHWAYS_STORAGE_KEY, JSON.stringify(starredPathways));
    localStorage.setItem(ACADEMIC_STATUS_STORAGE_KEY, JSON.stringify(academicStatus));
    if (session?.user?.email) {

    }
  }, [pathways, starredPathways, academicStatus, isHydrated, session]);

  function openPathway(pathwayKey: string) {
    const normalizedPathwayKey = normalizePathwayKey(pathwayKey);
    if (!normalizedPathwayKey) return;

    const pathwayData = pathways[normalizedPathwayKey];
    if (pathwayData) {
      setActivePathwayKey(normalizedPathwayKey);
      setActivePathway(JSON.parse(JSON.stringify(pathwayData)));
    }
    setShowModal(true);
  }

  function handleCourseToggle(
    courseType: "required" | "elective",
    index: number,
    checked: boolean
  ) {
    setActivePathway((prev) => {
      if (!prev) return prev;

      const updated = { ...prev };
      const creditsData = updated.requirements.courseCredits;

      if (courseType === "required") {
        creditsData.requiredCourses[index].completed = checked;
      } else {
        creditsData.electiveCourseOptions[index].completed = checked;
      }

      return updated;
    });
  }
  function extractProgress(pathwaysState: typeof pathways) {
    return Object.entries(pathwaysState).flatMap(([_, pathway]) => [
      ...pathway.requirements.courseCredits.requiredCourses
        .filter((c) => "completed" in c && c.completed)
        .map((c) => c.name as string),
      ...pathway.requirements.courseCredits.electiveCourseOptions
        .filter((c) => "completed" in c && c.completed)
        .map((c) => c.name as string),
    ]).join(";");
  }
  function handleSave() {
    if (activePathway && activePathwayKey) {
      const completedNames = new Set([
        ...activePathway.requirements.courseCredits.requiredCourses
          .filter(c => "completed" in c && c.completed).map(c => c.name),
        ...activePathway.requirements.courseCredits.electiveCourseOptions
          .filter(c => "completed" in c && c.completed).map(c => c.name),
      ]);

      const uncompletedNames = new Set([
        ...activePathway.requirements.courseCredits.requiredCourses
          .filter(c => !("completed" in c) || !c.completed).map(c => c.name),
        ...activePathway.requirements.courseCredits.electiveCourseOptions
          .filter(c => !("completed" in c) || !c.completed).map(c => c.name),
      ]);

      const syncedPathways = Object.fromEntries(
        Object.entries({ ...pathways, [activePathwayKey]: activePathway }).map(
          ([key, pathway]) => [
            key,
            {
              ...pathway,
              requirements: {
                ...pathway.requirements,
                courseCredits: {
                  ...pathway.requirements.courseCredits,
                  requiredCourses: pathway.requirements.courseCredits.requiredCourses.map(c => ({
                    ...c,
                    completed: completedNames.has(c.name ?? "") ? true
                      : uncompletedNames.has(c.name ?? "") ? false
                        : "completed" in c ? c.completed : false,
                  })),
                  electiveCourseOptions: pathway.requirements.courseCredits.electiveCourseOptions.map(c => ({
                    ...c,
                    completed: completedNames.has(c.name ?? "") ? true
                      : uncompletedNames.has(c.name ?? "") ? false
                        : "completed" in c ? c.completed : false,
                  })),
                },
              },
            },
          ]
        )
      ) as unknown as typeof pathways;

      setPathways(syncedPathways);

      if (session?.user?.email) {
        fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            User_Email: session.user.email,
            Stored_Pathways: starredPathways,
            Pathway_Progress: extractProgress(syncedPathways),
          }),
        }).catch(() => { });
      }

      setShowModal(false);
    }
  }

  const globalReqsMet = academicStatus.reading && academicStatus.math;
  const pendingActionsCount = [
    starredPathways.length === 0,
    !academicStatus.reading,
    !academicStatus.math,
  ].filter(Boolean).length;

  const totalEarnedCredits = starredPathways.reduce((sum, key) => {
    const normalizedPathwayKey = normalizePathwayKey(key);
    if (!normalizedPathwayKey) return sum;

    const pathway = pathways[normalizedPathwayKey];
    if (!pathway) return sum;
    return sum + getPathwayStats(pathway).earnedCredits;
  }, 0);

  const activeCanonicalPathway = activePathwayKey
    ? pathways[activePathwayKey]
    : null;
  const isActivePathwayTCD = Boolean(activeCanonicalPathway?.tcd ?? activePathway?.tcd);

  if (isLoadingPathways) {
    return (
      <div className="min-h-screen w-full font-sans bg-(--bg-primary) text-(--text-primary)">
        <div className="w-full min-h-screen px-12 py-4 md:px-14 md:py-8 space-y-8 flex flex-col max-w-412.5 mx-auto">
          <div className="bg-(--bg-card) border border-(--border-primary) rounded-xl p-6">
            Loading pathways...
          </div>
        </div>
      </div>
    );
  }

  if (pathwaysLoadError) {
    return (
      <div className="min-h-screen w-full font-sans bg-(--bg-primary) text-(--text-primary)">
        <div className="w-full min-h-screen px-12 py-4 md:px-14 md:py-8 space-y-8 flex flex-col max-w-412.5 mx-auto">
          <div className="bg-(--danger-soft) border border-(--danger) text-(--danger) rounded-xl p-6">
            {pathwaysLoadError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-sans bg-(--bg-primary) text-(--text-primary)">
      <div className="w-full min-h-screen px-12 py-4 md:px-14 md:py-8 space-y-8 flex flex-col max-w-412.5 mx-auto">
        <DashboardHeader userName={session?.user?.name || "Student"} isLoggedIn={!!session} />

        <QuickStats
          activeEndorsements={starredPathways.length}
          totalCreditsEarned={totalEarnedCredits}
          pendingActionsCount={pendingActionsCount}
        />

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <PathwaysList
            starredPathways={starredPathways}
            pathways={pathways}
            onPathwayClick={openPathway}
            globalReqsMet={globalReqsMet}
          />

          <ActionItems
            starredPathways={starredPathways}
            academicStatus={academicStatus}
            setAcademicStatus={setAcademicStatus}
            academicSuccessData={academicSuccessData}
          />
        </div>
      </div>

      <PathwayDetailsModal
        isOpen={showModal}
        pathway={activePathway}
        globalReqsMet={globalReqsMet}
        isTCD={isActivePathwayTCD}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onCourseToggle={handleCourseToggle}
      />
    </div>
  );
}
