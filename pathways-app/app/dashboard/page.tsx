"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import academicSuccessData from "../data/pathways/academic-success.json";
import { pathways as pathwaysData } from "../data/pathways";

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

export default function Dashboard() {
  const [dbUsername, setDbUsername] = useState<string>("");

  const basePathways = useMemo(
    () => pathwaysData as unknown as Record<string, Pathway>,
    []
  );
  const [pathways, setPathways] = useState<Record<string, Pathway>>(basePathways);
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

  const pathwayKeyById = useMemo(() => {
    return Object.entries(basePathways).reduce<Record<string, string>>(
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
  }, [basePathways]);

  const normalizePathwayKey = useCallback(
    (keyOrId: string): string | null => pathwayKeyById[keyOrId] ?? null,
    [pathwayKeyById]
  );

  // Load from localStorage on mount
  useEffect(() => {

    async function loadData() {

      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`);
          if (res.ok) {

            const data = await res.json();
            const user = data[0];
            if (user?.Username) {
              setDbUsername(user.Username);
            }
            if (typeof user?.Reading_Competency === "number" || typeof user?.Math_Competency === "number") {
              const status = {
                reading: user.Reading_Competency === 1,
                math: user.Math_Competency === 1,
              };
              setAcademicStatus(status);
              localStorage.setItem(ACADEMIC_STATUS_STORAGE_KEY, JSON.stringify(status));
            }

            console.log(user.Pathway_Progress);
            if (user && Array.isArray(user.Stored_Pathways)) {
              const validPathways = Array.from(
                new Set(
                  user.Stored_Pathways
                    .filter((key: unknown): key is string => typeof key === "string")
                    .map((key: string) => normalizePathwayKey(key))
                    .filter((key: string | null): key is string => key !== null)
                )
              ) as string[];

              localStorage.setItem(STARRED_PATHWAYS_STORAGE_KEY, JSON.stringify(validPathways));
              setStarredPathways(validPathways);
            }
            if (user?.Pathway_Progress && Array.isArray(user.Pathway_Progress)) {
              const completedCourses = new Set<string>(user.Pathway_Progress);

              const updatedPathways = Object.fromEntries(
                Object.entries(basePathways).map(([key, pathway]) => [
                  key,
                  {
                    ...pathway,
                    requirements: {
                      ...pathway.requirements,
                      courseCredits: {
                        ...pathway.requirements.courseCredits,
                        requiredCourses: pathway.requirements.courseCredits.requiredCourses.map(c => ({
                          ...c,
                          completed: completedCourses.has(c.name ?? ""),
                        })),
                        electiveCourseOptions: pathway.requirements.courseCredits.electiveCourseOptions.map(c => ({
                          ...c,
                          completed: completedCourses.has(c.name ?? ""),
                        })),
                      },
                    },
                  },
                ])
              ) as Record<string, Pathway>;

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
                  .map((key) => normalizePathwayKey(key))
                  .filter((key): key is string => key !== null)
              )
            );
            setStarredPathways(validPathways);
          }
        }

        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          if (parsedProgress && typeof parsedProgress === "object") {
            const validProgressEntries = Object.entries(parsedProgress)
              .map(([key, value]) => [normalizePathwayKey(key), value] as const)
              .filter(
                (entry): entry is readonly [string, Pathway] => {
                  const [normalizedKey, value] = entry;
                  if (!normalizedKey || !value || typeof value !== "object") return false;

                  const pathwayCandidate = value as Partial<Pathway>;
                  return (
                    !!pathwayCandidate.requirements &&
                    !!pathwayCandidate.requirements.courseCredits &&
                    Array.isArray(pathwayCandidate.requirements.courseCredits.requiredCourses) &&
                    Array.isArray(pathwayCandidate.requirements.courseCredits.electiveCourseOptions)
                  );
                }
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
  }, [session, normalizePathwayKey]);

  // Save to localStorage whenever state changes
  const prevAcademicStatus = React.useRef<AcademicStatus | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!session?.user?.email) return;

    if (
      prevAcademicStatus.current?.reading === academicStatus.reading &&
      prevAcademicStatus.current?.math === academicStatus.math
    ) return;

    prevAcademicStatus.current = academicStatus;

    fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        User_Email: session.user.email,
        Reading_Competency: academicStatus.reading ? 1 : 0,
        Math_Competency: academicStatus.math ? 1 : 0,
      }),
    }).catch(() => { });
  }, [academicStatus, isHydrated, session]);
  useEffect(() => {
    if (!isHydrated) return;
    if (!session?.user?.email) return;

    fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        User_Email: session.user.email,
        Reading_Competency: academicStatus.reading ? 1 : 0,
        Math_Competency: academicStatus.math ? 1 : 0,
      }),
    }).catch(() => { });
  }, [academicStatus, isHydrated, session]);
  function openPathway(pathwayKey: string) {
    const normalizedPathwayKey = normalizePathwayKey(pathwayKey);
    if (!normalizedPathwayKey) return;

    const pathwayData = pathways[normalizedPathwayKey as keyof typeof pathways];
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
        .filter((c: any) => c.completed)
        .map((c: any) => c.name as string),
      ...pathway.requirements.courseCredits.electiveCourseOptions
        .filter((c: any) => c.completed)
        .map((c: any) => c.name as string),
    ]).join(";");
  }
  function handleSave() {
    if (activePathway && activePathwayKey) {
      const completedNames = new Set([
        ...activePathway.requirements.courseCredits.requiredCourses
          .filter(c => c.completed).map(c => c.name),
        ...activePathway.requirements.courseCredits.electiveCourseOptions
          .filter(c => c.completed).map(c => c.name),
      ]);

      const uncompletedNames = new Set([
        ...activePathway.requirements.courseCredits.requiredCourses
          .filter(c => !c.completed).map(c => c.name),
        ...activePathway.requirements.courseCredits.electiveCourseOptions
          .filter(c => !c.completed).map(c => c.name),
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
                        : (c as any).completed,
                  })),
                  electiveCourseOptions: pathway.requirements.courseCredits.electiveCourseOptions.map(c => ({
                    ...c,
                    completed: completedNames.has(c.name ?? "") ? true
                      : uncompletedNames.has(c.name ?? "") ? false
                        : (c as any).completed,
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
            Reading_Competency: academicStatus.reading ? 1 : 0,
            Math_Competency: academicStatus.math ? 1 : 0,
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

    const pathway = pathways[normalizedPathwayKey as keyof typeof pathways] as
      | Pathway
      | undefined;
    if (!pathway) return sum;
    return sum + getPathwayStats(pathway).earnedCredits;
  }, 0);

  const activeCanonicalPathway = activePathwayKey
    ? pathwaysData[activePathwayKey as keyof typeof pathwaysData]
    : null;
  const isActivePathwayTCD = Boolean(activeCanonicalPathway?.tcd ?? activePathway?.tcd);

  return (
    <div className="min-h-screen w-full font-sans bg-(--bg-primary) text-(--text-primary)">
      <div className="w-full min-h-screen px-12 py-4 md:px-14 md:py-8 space-y-8 flex flex-col max-w-412.5 mx-auto">
        <DashboardHeader userName={dbUsername || session?.user?.name || "Student"} isLoggedIn={!!session} />

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