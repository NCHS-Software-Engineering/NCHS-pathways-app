import { Pathway, Course, CourseGroupRequirement, CourseRequirement, PathwayStats } from "./types";

export const STARRED_PATHWAYS_STORAGE_KEY = "starredPathways";
export const PATHWAY_PROGRESS_STORAGE_KEY = "pathwayProgress";
export const ACADEMIC_STATUS_STORAGE_KEY = "academicStatusProgress";

function safeCredits(course: Partial<Course>): number {
  const credits = course.credits;
  return typeof credits === "number" && Number.isFinite(credits) ? credits : 0;
}

export function isCourseGroupRequirement(
  requirement: CourseRequirement
): requirement is CourseGroupRequirement {
  return typeof requirement === "object" && requirement !== null && "options" in requirement;
}

function getCompletedCourseNamesFromRequirement(requirement: CourseRequirement): string[] {
  if (isCourseGroupRequirement(requirement)) {
    return requirement.options
      .filter((option) => option.completed)
      .map((option) => option.name)
      .filter((name): name is string => typeof name === "string" && name.length > 0);
  }

  return requirement.completed && typeof requirement.name === "string" && requirement.name.length > 0
    ? [requirement.name]
    : [];
}

function getRequirementEarnedCredits(requirement: CourseRequirement): number {
  if (isCourseGroupRequirement(requirement)) {
    const selectedOptions = requirement.options.filter((option) => option.completed);
    if (selectedOptions.length === 0) return 0;

    const maxOptionCredits = Math.max(
      ...requirement.options.map((option) => safeCredits(option)),
      0
    );

    return Math.min(selectedOptions.length, Math.max(1, requirement.minSelections ?? 1)) * maxOptionCredits;
  }

  return requirement.completed ? safeCredits(requirement) : 0;
}

export function collectCompletedCourseNames(pathway: Pathway): string[] {
  const courseCredits = pathway.requirements.courseCredits;

  return [
    ...courseCredits.requiredCourses.flatMap((requirement) => getCompletedCourseNamesFromRequirement(requirement)),
    ...courseCredits.electiveCourseOptions
      .filter((course) => course.completed)
      .map((course) => course.name)
      .filter((name): name is string => typeof name === "string" && name.length > 0),
  ];
}

export function applyCourseProgress(pathway: Pathway, completedCourseNames: Set<string>): Pathway {
  const courseCredits = pathway.requirements.courseCredits;

  return {
    ...pathway,
    requirements: {
      ...pathway.requirements,
      courseCredits: {
        ...courseCredits,
        requiredCourses: courseCredits.requiredCourses.map((requirement) => {
          if (isCourseGroupRequirement(requirement)) {
            return {
              ...requirement,
              options: requirement.options.map((option) => ({
                ...option,
                completed: completedCourseNames.has(option.name),
              })),
            };
          }

          return {
            ...requirement,
            completed: completedCourseNames.has(requirement.name),
          };
        }),
        electiveCourseOptions: courseCredits.electiveCourseOptions.map((course) => ({
          ...course,
          completed: completedCourseNames.has(course.name),
        })),
      },
    },
  };
}

export function getPathwayStats(pathway: Pathway): PathwayStats {
  const req = pathway.requirements.courseCredits;
  const earnedReq = req.requiredCourses.reduce(
    (sum: number, requirement) => sum + getRequirementEarnedCredits(requirement),
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
