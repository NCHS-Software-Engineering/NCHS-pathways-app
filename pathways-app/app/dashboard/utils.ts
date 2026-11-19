import { Pathway, Course, PathwayStats } from "./types";

export const STARRED_PATHWAYS_STORAGE_KEY = "starredPathways";
export const PATHWAY_PROGRESS_STORAGE_KEY = "pathwayProgress";
export const ACADEMIC_STATUS_STORAGE_KEY = "academicStatusProgress";

function safeCredits(course: Partial<Course>): number {
  const credits = course.credits;
  return typeof credits === "number" && Number.isFinite(credits) ? credits : 0;
}

function sumTopCredits(credits: number[], count: number): number {
  if (credits.length === 0 || count <= 0) return 0;

  return [...credits]
    .sort((a, b) => b - a)
    .slice(0, count)
    .reduce((sum, credit) => sum + credit, 0);
}

export function getPathwayStats(pathway: Pathway): PathwayStats {
  const req = pathway.requirements.courseCredits;
  const requiredOptionGroups = Array.isArray(req.requiredCourseOptionGroups)
    ? req.requiredCourseOptionGroups
    : [];
  const earnedReq = req.requiredCourses.reduce(
    (sum: number, c: Course) => sum + (c.completed ? safeCredits(c) : 0),
    0
  );
  const earnedReqFromOptions = requiredOptionGroups.reduce((sum: number, group) => {
    const completedOptionCredits = (group.options ?? [])
      .filter((option) => option.completed)
      .map((option) => safeCredits(option));
    const requiredSelections = Math.max(
      1,
      Math.min(group.requiredSelections ?? 1, (group.options ?? []).length || 1)
    );
    const countedCredits = sumTopCredits(completedOptionCredits, requiredSelections);

    return sum + countedCredits;
  }, 0);
  const earnedElec = req.electiveCourseOptions.reduce(
    (sum: number, c: Course) => sum + (c.completed ? safeCredits(c) : 0),
    0
  );

  const requiredCreditsRequired = Math.max(
    0,
    req.totalCreditsRequired - req.electiveCreditsRequired
  );
  const effectiveEarnedReq = Math.min(earnedReq + earnedReqFromOptions, requiredCreditsRequired);
  const effectiveEarnedElec = Math.min(earnedElec, req.electiveCreditsRequired);
  const earnedCredits = effectiveEarnedReq + effectiveEarnedElec;

  const progress =
    req.totalCreditsRequired > 0
      ? Math.min(100, Math.round((earnedCredits / req.totalCreditsRequired) * 100))
      : 0;

  return {
    earnedCredits,
    totalCredits: req.totalCreditsRequired,
    progress,
    earnedReq: earnedReq + earnedReqFromOptions,
    earnedElec,
  };
}
