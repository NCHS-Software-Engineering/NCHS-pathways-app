import { Pathway, Course, PathwayStats } from "./types";

export const STARRED_PATHWAYS_STORAGE_KEY = "starredPathways";
export const PATHWAY_PROGRESS_STORAGE_KEY = "pathwayProgress";
export const ACADEMIC_STATUS_STORAGE_KEY = "academicStatusProgress";

function safeCredits(course: Partial<Course>): number {
  const credits = course.credits;
  return typeof credits === "number" && Number.isFinite(credits) ? credits : 0;
}

export function getPathwayStats(pathway: Pathway): PathwayStats {
  const req = pathway.requirements.courseCredits;
  const earnedReq = req.requiredCourses.reduce(
    (sum: number, c: Course) => sum + (c.completed ? safeCredits(c) : 0),
    0
  );
  const earnedElec = req.electiveCourseOptions.reduce(
    (sum: number, c: Course) => sum + (c.completed ? safeCredits(c) : 0),
    0
  );

  const requiredCreditsRequired = Math.max(
    0,
    req.totalCreditsRequired - req.electiveCreditsRequired
  );
  const effectiveEarnedReq = Math.min(earnedReq, requiredCreditsRequired);
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
    earnedReq,
    earnedElec,
  };
}
