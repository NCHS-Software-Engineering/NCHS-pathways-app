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
  const [pathways, setPathways] = useState(pathwaysData);
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
    return Object.entries(pathwaysData).reduce<Record<string, string>>(
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
  }, []);

  const normalizePathwayKey = useCallback(
    (keyOrId: string): string | null => pathwayKeyById[keyOrId] ?? null,
    [pathwayKeyById]
  );

  // Load from localStorage on mount
  useEffect(() => {
    const savedStarred = localStorage.getItem(STARRED_PATHWAYS_STORAGE_KEY);
    const savedProgress = localStorage.getItem(PATHWAY_PROGRESS_STORAGE_KEY);
    const savedAcademicStatus = localStorage.getItem(ACADEMIC_STATUS_STORAGE_KEY);

    try {
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
              (
                entry
              ): entry is readonly [string, Record<string, unknown>] =>
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
  }, [normalizePathwayKey]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(PATHWAY_PROGRESS_STORAGE_KEY, JSON.stringify(pathways));
    localStorage.setItem(STARRED_PATHWAYS_STORAGE_KEY, JSON.stringify(starredPathways));
    localStorage.setItem(ACADEMIC_STATUS_STORAGE_KEY, JSON.stringify(academicStatus));
  }, [pathways, starredPathways, academicStatus, isHydrated]);

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

  function handleSave() {
    if (activePathway && activePathwayKey) {
      setPathways((prevPathways: typeof pathways) => ({
        ...prevPathways,
        [activePathwayKey]: activePathway,
      }));
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
