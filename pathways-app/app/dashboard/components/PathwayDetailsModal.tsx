"use client";

import React, { useEffect } from "react";
import { BookOpen, GraduationCap, AlertCircle, Save, Info, ExternalLink, User } from "lucide-react";
import { Pathway, Course } from "../types";
import { getPathwayStats, isCourseGroupRequirement } from "../utils";

interface PathwayDetailsModalProps {
  isOpen: boolean;
  pathway: Pathway | null;
  globalReqsMet: boolean;
  isTCD: boolean;
  onClose: () => void;
  onSave: () => void;
  onCounselorPopupRequest: (pathwayName: string) => void;
  onCourseToggle: (
    courseType: "required" | "elective",
    index: number,
    checked: boolean
  ) => void;
  onGroupOptionToggle: (
    groupIndex: number,
    optionIndex: number,
    checked: boolean
  ) => void;
}

export function PathwayDetailsModal({
  isOpen,
  pathway,
  globalReqsMet,
  isTCD,
  onClose,
  onSave,
  onCounselorPopupRequest,
  onCourseToggle,
  onGroupOptionToggle,
}: PathwayDetailsModalProps) {

  useEffect(() => {
    if (!isOpen) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen || !pathway) return null;

  const stats = getPathwayStats(pathway);
  const requiredCreditsEarned = pathway.requirements.courseCredits.requiredCourses.reduce(
    (sum: number, requirement) => {
      if (isCourseGroupRequirement(requirement)) {
        const selectedOptions = requirement.options.filter((option) => option.completed);
        if (selectedOptions.length === 0) return sum;

        const maxOptionCredits = Math.max(
          ...requirement.options.map((option) => Number(option.credits) || 0),
          0
        );

        return (
          sum +
          Math.min(selectedOptions.length, Math.max(1, requirement.minSelections)) * maxOptionCredits
        );
      }

      return sum + (requirement.completed ? Number(requirement.credits) || 0 : 0);
    },
    0
  );

  const handleSaveClick = () => {
    if (stats.progress === 100 && !globalReqsMet) {
      onCounselorPopupRequest(pathway.title);
      return;
    }

    onSave();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-(--overlay-backdrop) backdrop-blur-sm font-sans"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg md:max-w-3xl flex-col overflow-hidden rounded-3xl border border-(--border-primary) bg-(--bg-card) shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-(--border-primary) bg-linear-to-br from-(--bg-card) via-(--bg-card) to-(--bg-soft) px-6 pt-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-(--brand-soft) px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-(--brand-text)">
                  Endorsement Details
                </span>
                <span className="rounded-full border border-(--border-primary) bg-(--bg-card) px-3 py-1 text-[11px] font-semibold text-(--text-secondary)">
                  {stats.progress}% complete
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-(--text-primary)">
                {pathway.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-(--border-primary) bg-(--bg-card) p-2.5 text-(--text-secondary) transition-colors hover:border-(--brand) hover:text-(--text-primary)"
              aria-label="Close pathway details"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div>
            <div className="flex justify-between text-base mb-2">
              <span className="font-semibold text-(--text-primary)">
                Pathway Coursework Completion
              </span>
              <span className="font-bold text-(--modal-accent-text)">{stats.progress}%</span>
            </div>
            <div className="w-full bg-(--bg-soft) h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  stats.progress === 100
                    ? "bg-(--success)"
                    : "bg-(--modal-progress-incomplete)"
                }`}
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          {isTCD && (
            <div className="bg-(--tcd-dash-bg) border border-(--tcd-dash-border) text-(--tcd-dash-text) p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <Info size={20} className="mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">TCD Program Requirements</h4>
                <p className="text-xs mt-1 opacity-90">
                  This endorsement requires coursework at the <strong>Technology Center of DuPage (TCD)</strong>. Participation requires a separate application and will take up 4 periods of your daily high school schedule.
                </p>
                <a
                  href="https://app.schoolinks.com/course-catalog/naperville-community-unit-school-district-203/overview/technology-center-of-dupage"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-(--bg-card) text-(--tcd-dash-text) rounded-md border border-(--tcd-dash-border) text-xs font-medium hover:bg-(--bg-soft) transition-colors"
                >
                  View More Information <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          {stats.progress === 100 && !globalReqsMet && (
            <div className="bg-(--status-warning-light) border border-(--status-warning)/30 text-(--status-warning-text) p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <span className="rounded-full bg-(--brand) p-2.5 mt-0.5 shrink-0">
                <User size={18} className="text-(--text-on-brand)" />
              </span>
              <div>
                <h4 className="font-semibold text-base">Check in with your counselor</h4>
                <p className="text-sm mt-1 opacity-90">
                  You have finished the pathway coursework, but this website does not automatically apply you for the endorsement. Check in with your counselor to confirm your progress on the pathway and make sure you are done.
                </p>
              </div>
            </div>
          )}

          <div className="border border-(--border-primary) rounded-xl overflow-hidden bg-(--bg-card)">
            <div className="p-4 border-b border-(--border-primary) bg-(--bg-soft) flex justify-between items-center">
              <div>
                <h4 className="font-medium text-(--text-primary) flex items-center gap-2">
                  <BookOpen size={18} className="text-(--brand)" />
                  Required Courses
                </h4>
                <p className="text-sm text-(--text-secondary) mt-1">
                  Check off classes you have completed.
                </p>
                <p className="text-xs text-(--text-secondary) mt-1">
                  <span className="font-semibold">All courses must be completed with a C or higher.</span>
                </p>
              </div>
              <span className="rounded-full bg-(--bg-card) px-3 py-1 text-sm font-semibold text-(--text-secondary) shadow-sm">
                {requiredCreditsEarned} credits earned
              </span>
            </div>

            <div className="space-y-3 p-2">
              {pathway.requirements.courseCredits.requiredCourses.map((requirement, idx) => {
                if (isCourseGroupRequirement(requirement)) {
                  const selectedCount = requirement.options.filter((option) => option.completed).length;

                  return (
                    <div
                      key={`req-group-${idx}`}
                      className="overflow-hidden rounded-2xl border border-(--border-primary) bg-(--bg-card) shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-(--border-primary) bg-(--bg-soft) px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-(--brand-soft) px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-(--brand-text)">
                              Choose one
                            </span>
                            <span className="text-xs font-semibold text-(--text-secondary)">
                              {selectedCount} selected
                            </span>
                          </div>
                          <p className="text-base font-semibold text-(--text-primary)">
                            {requirement.groupLabel}
                          </p>
                          <p className="text-xs text-(--text-secondary)">
                            Select one pathway option to satisfy the capstone requirement.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 p-3">
                        {requirement.options.map((option, optionIndex) => (
                          <label
                            key={`req-group-${idx}-option-${optionIndex}`}
                            className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                              option.completed
                                ? "border-(--brand) bg-(--brand-soft) shadow-sm"
                                : "border-(--border-primary) bg-(--bg-card) hover:border-(--brand) hover:bg-(--bg-soft)"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`req-group-${idx}`}
                              checked={option.completed ?? false}
                              onChange={(e) =>
                                onGroupOptionToggle(idx, optionIndex, e.target.checked)
                              }
                              className="w-5 h-5 rounded-full border-(--border-primary) text-(--brand) focus:ring-(--brand) cursor-pointer"
                            />
                            <div className="flex-1 flex justify-between items-center gap-3">
                              <span className="text-sm md:text-base text-(--text-primary) flex items-center gap-2 leading-tight">
                                <span
                                  className={
                                    option.completed
                                      ? "line-through text-(--text-secondary) decoration-1"
                                      : "text-(--text-primary)"
                                  }
                                >
                                  {option.name}
                                </span>
                                {option.earlyCollegeCredit && (
                                  <span className="text-xs bg-(--badge-college-bg) text-(--badge-college-text) px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                                    College Credit
                                  </span>
                                )}
                              </span>
                              <span className="text-sm font-medium text-(--text-secondary)">
                                {option.credits} cr
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <label
                    key={`req-${idx}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--bg-soft) cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={requirement.completed ?? false}
                      onChange={(e) => onCourseToggle("required", idx, e.target.checked)}
                      className="w-5 h-5 rounded border-(--border-primary) text-(--brand) focus:ring-(--brand) cursor-pointer"
                    />
                    <div className="flex-1 flex justify-between items-center gap-3">
                      <span className="text-base text-(--text-primary) flex items-center gap-2 leading-tight">
                        <span
                          className={
                            requirement.completed
                              ? "line-through text-(--text-secondary) decoration-1"
                              : "text-(--text-primary)"
                          }
                        >
                          {requirement.name}
                        </span>
                        {requirement.earlyCollegeCredit && (
                          <span className="text-xs bg-(--badge-college-bg) text-(--badge-college-text) px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                            College Credit
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-medium text-(--text-secondary)">
                        {requirement.credits} cr
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {!isTCD && (
            <div className="border border-(--border-primary) rounded-xl overflow-hidden bg-(--bg-card)">
              <div className="p-4 border-b border-(--border-primary) bg-(--bg-soft) flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-(--text-primary) flex items-center gap-2">
                    <GraduationCap size={18} className="text-(--brand)" />
                    Elective Options
                  </h4>
                  <p className="text-xs text-(--text-secondary) mt-1">
                    {pathway.requirements.courseCredits.electiveCreditsRequired} elective credits required.
                  </p>
                  <p className="text-xs text-(--text-secondary) mt-0.5">
                    <span className="font-semibold">All electives must be completed with a C or higher.</span>
                  </p>
                </div>
                <span className="text-sm font-semibold text-(--text-secondary)">
                  {pathway.requirements.courseCredits.electiveCourseOptions.reduce(
                    (sum: number, c: Course) => sum + (c.completed ? c.credits : 0),
                    0
                  )} / {pathway.requirements.courseCredits.electiveCreditsRequired} cr
                </span>
              </div>

              {pathway.requirements.courseCredits.electiveCourseOptions.length > 0 ? (
                <div className="p-2 space-y-1">
                  {pathway.requirements.courseCredits.electiveCourseOptions.map(
                    (course: Course, idx: number) => (
                      <label
                        key={`elec-${idx}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--bg-soft) cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={course.completed ?? false}
                          onChange={(e) => onCourseToggle("elective", idx, e.target.checked)}
                          className="w-5 h-5 rounded border-(--border-primary) text-(--brand) focus:ring-(--brand) cursor-pointer"
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <span
                            className={`text-sm ${
                              course.completed ? "line-through text-(--text-secondary)" : "text-(--text-primary)"
                            }`}
                          >
                            {course.name}
                            {course.earlyCollegeCredit && (
                              <span className="ml-2 text-[10px] bg-(--badge-college-bg) text-(--badge-college-text) px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                                College Credit
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-medium text-(--text-secondary)">
                            {course.credits} cr
                          </span>
                        </div>
                      </label>
                    )
                  )}
                </div>
              ) : (
                <div className="p-5 text-center bg-gray-50/50">
                  <p className="text-sm text-(--text-secondary) italic">
                    No elective credits required for this pathway.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-(--border-primary) bg-(--bg-soft) flex justify-between items-center">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-(--text-secondary) font-medium transition-colors hover:bg-(--bg-card) hover:text-(--text-primary)"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="flex items-center gap-2 rounded-xl bg-(--brand) px-5 py-2.5 font-medium text-(--text-on-brand) shadow-sm transition-opacity hover:opacity-90"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
