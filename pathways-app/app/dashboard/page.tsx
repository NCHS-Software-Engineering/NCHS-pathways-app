"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, GraduationCap, X } from "lucide-react";
import academicSuccessData from "../data/pathways/academic-success.json";
import { pathways as pathwaysData } from "../data/pathways";

import { DashboardHeader } from "./components/DashboardHeader";
import { QuickStats } from "./components/QuickStats";
import { PathwaysList } from "./components/PathwaysList";
import { ActionItems } from "./components/ActionItems";
import { PathwayDetailsModal } from "@/app/dashboard/components/PathwayDetailsModal";

import { Pathway, AcademicStatus } from "./types";
import {
  STARRED_PATHWAYS_STORAGE_KEY,
  PATHWAY_PROGRESS_STORAGE_KEY,
  ACADEMIC_STATUS_STORAGE_KEY,
  applyCourseProgress,
  collectCompletedCourseNames,
  getPathwayStats,
  isCourseGroupRequirement,
} from "./utils";

// ─── Counselor Check-In Modal ────────────────────────────────────────────────
function CounselorCheckInModal({
  isOpen,
  pathwayName,
  onClose,
}: {
  isOpen: boolean;
  pathwayName: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-(--overlay-backdrop) backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-(--border-primary) bg-(--bg-card) shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient Bar */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-blue-400 via-indigo-500 to-purple-500" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-(--text-secondary) transition-colors hover:bg-(--bg-soft) hover:text-(--text-primary)"
          aria-label="Close confirmation dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {/* Icon with soft glow effect */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--competency-reading-soft) text-(--modal-accent-text) ring-8 ring-(--competency-reading-accent)/50">
            <GraduationCap className="h-8 w-8" />
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-(--text-primary) tracking-tight">
              Check In With Your Counselor
            </h2>
            {pathwayName && (
              <p className="mt-2 text-sm font-semibold text-(--modal-accent-text) uppercase tracking-wider">
                {pathwayName}
              </p>
            )}
          </div>

          {/* Body Callouts */}
          <div className="mb-8 space-y-3">
            {/* Success Callout */}
            <div className="flex items-start gap-3 rounded-xl border border-(--badge-success-border) bg-(--badge-success-bg) p-4 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-(--success)" />
              <p className="text-sm leading-relaxed text-(--status-complete)">
                It looks like you have completed all the requirements for this pathway. 
                <span className="block font-bold mt-1 text-(--action-soft-text)">
                  This site does not automatically submit your endorsement.
                </span>
              </p>
            </div>

            {/* Action Required Callout */}
            <div className="flex items-start gap-3 rounded-xl border border-(--status-warning-border) bg-(--status-warning-light) p-4 shadow-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-(--status-warning-icon)" />
              <p className="text-sm leading-relaxed text-(--status-warning-text) font-medium">
                Please schedule a meeting with your counselor to confirm your progress and officially complete the endorsement.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-(--modal-accent-text) hover:bg-(--credits-icon-text) px-4 py-3.5 text-sm font-bold text-(--bg-card) shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            Got it — I'll contact my counselor
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [dbUsername, setDbUsername] = useState<string>("");

  const basePathways = useMemo(
    () => pathwaysData as unknown as Record<string, Pathway>,
    []
  );
  const [apiPathways, setApiPathways] = useState<Record<string, Pathway>>({});
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

  // Counselor check-in state
  const [showCounselorAlert, setShowCounselorAlert] = useState(false);
  const [completedPathwayName, setCompletedPathwayName] = useState<string>("");

  const { data: session } = useSession();

  const pathwayKeyById = useMemo(() => {
    const allPathways = { ...basePathways, ...apiPathways };
    return Object.entries(allPathways).reduce<Record<string, string>>(
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
  }, [basePathways, apiPathways]);

  const normalizePathwayKey = useCallback(
    (keyOrId: string): string | null => pathwayKeyById[keyOrId] ?? null,
    [pathwayKeyById]
  );

  // Load pathways from the API so that admin-added pathways are recognised
  useEffect(() => {
    let isMounted = true;

    async function fetchApiPathways() {
      try {
        const res = await fetch("/api/pathways", { cache: "no-store" });
        if (!res.ok || !isMounted) return;

        const data = await res.json();
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setApiPathways(data as Record<string, Pathway>);
          // Also seed pathway state with any new pathways not in the static bundle
          setPathways((prev) => {
            const merged = { ...prev };
            for (const [key, value] of Object.entries(data as Record<string, Pathway>)) {
              if (!(key in merged)) {
                merged[key] = value;
              }
            }
            return merged;
          });
        }
      } catch {
        // Keep working with static pathways if the API is unavailable
      }
    }

    fetchApiPathways();
    return () => { isMounted = false; };
  }, []);

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

              setPathways((prevPathways) => {
                const updatedPathways = Object.fromEntries(
                  Object.entries(prevPathways).map(([key, pathway]) => [
                    key,
                    applyCourseProgress(pathway, completedCourses),
                  ])
                ) as Record<string, Pathway>;

                localStorage.setItem(PATHWAY_PROGRESS_STORAGE_KEY, JSON.stringify(updatedPathways));
                return updatedPathways;
              });
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
              setPathways((prevPathways) => {
                const mergedPathways = {
                  ...prevPathways,
                  ...Object.fromEntries(validProgressEntries),
                };

                return Object.fromEntries(
                  Object.entries(mergedPathways).map(([key, pathway]) => [
                    key,
                    applyCourseProgress(pathway, new Set(collectCompletedCourseNames(pathway))),
                  ])
                ) as Record<string, Pathway>;
              });
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

  function handleUnstarPathway(pathwayKey: string) {
    const updated = starredPathways.filter((k) => k !== pathwayKey);
    setStarredPathways(updated);
    localStorage.setItem(STARRED_PATHWAYS_STORAGE_KEY, JSON.stringify(updated));

    if (session?.user?.email) {
      fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          User_Email: session.user.email,
          Stored_Pathways: updated,
        }),
      }).catch(() => {});
    }
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
        const requirement = creditsData.requiredCourses[index];

        if (isCourseGroupRequirement(requirement)) {
          return prev;
        } else {
          requirement.completed = checked;
        }
      } else {
        creditsData.electiveCourseOptions[index].completed = checked;
      }

      return updated;
    });
  }

  function handleGroupOptionToggle(groupIndex: number, optionIndex: number, checked: boolean) {
    setActivePathway((prev) => {
      if (!prev) return prev;

      const updated = { ...prev };
      const requirement = updated.requirements.courseCredits.requiredCourses[groupIndex];

      if (!isCourseGroupRequirement(requirement)) return prev;

      requirement.options = requirement.options.map((option, currentOptionIndex) => ({
        ...option,
        completed: checked && currentOptionIndex === optionIndex,
      }));

      return updated;
    });
  }

  function extractProgress(pathwaysState: typeof pathways) {
    return Array.from(
      new Set(
        Object.values(pathwaysState).flatMap((pathway) => collectCompletedCourseNames(pathway))
      )
    ).join(";");
  }

  function handleSave() {
    if (activePathway && activePathwayKey) {
      const completedNames = new Set(collectCompletedCourseNames(activePathway));

      const syncedActivePathway = applyCourseProgress(activePathway, completedNames);
      const syncedPathways = {
        ...pathways,
        [activePathwayKey]: syncedActivePathway,
      } as typeof pathways;

      setPathways(syncedPathways);
      setActivePathway(syncedActivePathway);

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

      // ── Check if this pathway just became 100% complete ──────────────────
      const stats = getPathwayStats(activePathway);
      const isNowComplete = stats.progress === 100;

      setShowModal(false);

      if (isNowComplete) {
        setCompletedPathwayName(
          (activePathway as any).title ?? (activePathway as any).name ?? activePathwayKey ?? ""
        );
        setShowCounselorAlert(true);
      }
      // ─────────────────────────────────────────────────────────────────────
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
    ? (pathwaysData as Record<string, Pathway>)[activePathwayKey]
    : null;
  const isActivePathwayTCD = Boolean(activeCanonicalPathway?.tcd ?? activePathway?.tcd);

  return (
    <div className="min-h-screen w-full font-sans bg-(--bg-primary) text-(--text-primary)">
      <div className="w-full min-h-screen px-0 py-4 md:px-14 md:py-8 space-y-8 flex flex-col max-w-412.5 mx-auto">
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
            onUnstar={handleUnstarPathway}
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
        onGroupOptionToggle={handleGroupOptionToggle}
      />

      {/* Counselor Check-In Alert */}
      <CounselorCheckInModal
        isOpen={showCounselorAlert}
        pathwayName={completedPathwayName}
        onClose={() => setShowCounselorAlert(false)}
      />
    </div>
  );
}
