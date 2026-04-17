"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";

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

type PathwayCourseLike = {
  name?: unknown;
  credits?: unknown;
  earlyCollegeCredit?: unknown;
  completed?: unknown;
  groupLabel?: unknown;
  options?: unknown;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeCourseEntry(course: PathwayCourseLike, index: number) {
  if (Array.isArray(course.options)) {
    const options = course.options.filter(
      (option): option is { name?: unknown; credits?: unknown; earlyCollegeCredit?: unknown } =>
        option !== null && typeof option === "object"
    );

    const optionCredits = options
      .map((option) => (isFiniteNumber(option.credits) ? option.credits : 0))
      .filter((credits) => credits > 0);

    const maxCredits = optionCredits.length > 0 ? Math.max(...optionCredits) : 0;
    const label =
      typeof course.groupLabel === "string" && course.groupLabel.trim().length > 0
        ? course.groupLabel
        : `Grouped Requirement ${index + 1}`;

    return {
      name: label,
      credits: maxCredits,
      earlyCollegeCredit: options.some((option) => Boolean(option.earlyCollegeCredit)),
      completed: Boolean(course.completed),
    };
  }

  if (typeof course.name === "string" && isFiniteNumber(course.credits)) {
    return {
      name: course.name,
      credits: course.credits,
      earlyCollegeCredit: Boolean(course.earlyCollegeCredit),
      completed: Boolean(course.completed),
    };
  }

  return null;
}

function normalizePathwayForDashboard(pathway: Pathway): Pathway {
  const courseCredits = pathway.requirements?.courseCredits;
  if (!courseCredits) return pathway;

  const requiredCourses = Array.isArray(courseCredits.requiredCourses)
    ? courseCredits.requiredCourses
        .map((course, index) => normalizeCourseEntry(course as PathwayCourseLike, index))
        .filter((course): course is NonNullable<typeof course> => course !== null)
    : [];

  const electiveCourseOptions = Array.isArray(courseCredits.electiveCourseOptions)
    ? courseCredits.electiveCourseOptions
        .map((course, index) => normalizeCourseEntry(course as PathwayCourseLike, index))
        .filter((course): course is NonNullable<typeof course> => course !== null)
    : [];

  return {
    ...pathway,
    requirements: {
      ...pathway.requirements,
      courseCredits: {
        ...courseCredits,
        requiredCourses,
        electiveCourseOptions,
      },
    },
  };
}

function normalizePathwayRecord(pathwayRecord: Record<string, Pathway>) {
  return Object.fromEntries(
    Object.entries(pathwayRecord).map(([key, pathway]) => [key, normalizePathwayForDashboard(pathway)])
  ) as Record<string, Pathway>;
}

export default function Dashboard() {
  type AcademicSuccessData = {
    title: string;
    description: string;
    reading: {
      courseOptions: string[];
      examOptions: string[];
      testScoreOptions: string[];
    };
    math: {
      courseOptions: string[];
      examOptions: string[];
      testScoreOptions: string[];
    };
  };

  const [pathways, setPathways] = useState<Record<string, Pathway>>({});
  const [academicSuccessData, setAcademicSuccessData] = useState<AcademicSuccessData | null>(null);
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus>({
    reading: false,
    math: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [activePathway, setActivePathway] = useState<Pathway | null>(null);
  const [activePathwayKey, setActivePathwayKey] = useState<string | null>(null);
  const [starredPathways, setStarredPathways] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");

  const { data: session } = useSession();

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

    // Keep compatibility with legacy localStorage keys.
    if (keyMap.entreprenuership) {
      keyMap.entrepreneurship = keyMap.entreprenuership;
    }

    return keyMap;
  }, [pathways]);

  const normalizePathwayKey = useCallback(
    (keyOrId: string): string | null => pathwayKeyById[keyOrId] ?? null,
    [pathwayKeyById]
  );

  // Load canonical data + local progress on mount.
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setIsLoadingData(true);
        setLoadError("");

        const [pathwaysResponse, academicResponse] = await Promise.all([
          fetch("/api/pathways"),
          fetch("/api/academic-success"),
        ]);

        if (!pathwaysResponse.ok || !academicResponse.ok) {
          throw new Error("Failed to load pathway data.");
        }

        const pathwaysList = (await pathwaysResponse.json()) as Pathway[];
        const academicData = await academicResponse.json();

        if (!mounted) return;

        const canonicalPathways = normalizePathwayRecord(
          Object.fromEntries(
          pathwaysList
            .filter((pathway) => typeof pathway?.id === "string" && pathway.id.length > 0)
            .map((pathway) => [pathway.id, pathway])
          ) as Record<string, Pathway>
        );

        const keyMap = Object.entries(canonicalPathways).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            acc[key] = key;
            if (value?.id) {
              acc[value.id] = key;
            }
            return acc;
          },
          {}
        );

        if (keyMap.entreprenuership) {
          keyMap.entrepreneurship = keyMap.entreprenuership;
        }

        const savedStarred = localStorage.getItem(STARRED_PATHWAYS_STORAGE_KEY);
        const savedProgress = localStorage.getItem(PATHWAY_PROGRESS_STORAGE_KEY);
        const savedAcademicStatus = localStorage.getItem(ACADEMIC_STATUS_STORAGE_KEY);

        let hydratedPathways = canonicalPathways;

        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          if (parsedProgress && typeof parsedProgress === "object") {
            const validProgressEntries = Object.entries(parsedProgress)
              .map(([key, value]) => [keyMap[key] ?? null, value] as const)
              .filter(
                (
                  entry
                ): entry is readonly [string, Record<string, unknown>] =>
                  entry[0] !== null &&
                  entry[1] !== null &&
                  typeof entry[1] === "object"
              );

            if (validProgressEntries.length > 0) {
              hydratedPathways = {
                ...canonicalPathways,
                ...Object.fromEntries(validProgressEntries),
              };
            }
          }
        }

        hydratedPathways = normalizePathwayRecord(hydratedPathways);

        setPathways(hydratedPathways);
        setAcademicSuccessData(academicData);

        if (savedStarred) {
          const parsed = JSON.parse(savedStarred);
          if (Array.isArray(parsed)) {
            const validPathways = Array.from(
              new Set(
                parsed
                  .filter((key): key is string => typeof key === "string")
                  .map((key) => keyMap[key] ?? null)
                  .filter((key): key is string => key !== null)
              )
            );
            setStarredPathways(validPathways);
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
        if (!mounted) return;
        setLoadError("Could not load pathway data right now.");
      } finally {
        if (mounted) {
          setIsHydrated(true);
          setIsLoadingData(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

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

  const activeCanonicalPathway = activePathwayKey ? pathways[activePathwayKey] : null;
  const isActivePathwayTCD = Boolean(activeCanonicalPathway?.tcd ?? activePathway?.tcd);

  if (isLoadingData) {
    return (
      <div className="min-h-screen w-full font-sans bg-(--bg-primary) text-(--text-primary)">
        <div className="w-full min-h-screen px-12 py-8 md:px-14 space-y-8 flex flex-col max-w-412.5 mx-auto">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen w-full font-sans bg-(--bg-primary) text-(--text-primary)">
        <div className="w-full min-h-screen px-12 py-8 md:px-14 space-y-8 flex flex-col max-w-412.5 mx-auto">
          <div className="rounded-xl border border-(--danger) bg-(--danger-soft) text-(--danger) p-4">{loadError}</div>
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
