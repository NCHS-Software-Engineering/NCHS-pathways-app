"use client";

import React, { useEffect } from "react";
import FocusTrap from 'focus-trap-react';
import { BookOpen, GraduationCap, AlertCircle, Save, Info, ExternalLink } from "lucide-react";
import { Pathway, Course } from "../types";
import { getPathwayStats } from "../utils";

interface PathwayDetailsModalProps {
  isOpen: boolean;
  pathway: Pathway | null;
  globalReqsMet: boolean;
  isTCD: boolean;
  onClose: () => void;
  onSave: () => void;
  onCourseToggle: (
    courseType: "required" | "elective",
    index: number,
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
  onCourseToggle,
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

  return (
    <FocusTrap>
      <div
        className="fixed inset-0 bg-(--overlay-backdrop) backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans"
        onClick={onClose}
      >
        <div
          className="bg-(--bg-card) rounded-2xl w-full max-w-lg md:max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 pt-5 bg-(--bg-card)">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm font-bold tracking-wider uppercase text-(--modal-accent-text) mb-1 block">
                  Endorsement Details
                </span>
                <h2 className="text-2xl font-serif font-bold text-(--text-primary)">
                  {pathway.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-soft) hover:opacity-90 rounded-full p-2 transition-colors"
                aria-label="Close button"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between text-base mb-2">
                <span className="font-semibold text-(--text-primary)">
                  Pathway Coursework Completion
                </span>
                <span className="font-bold text-(--modal-accent-text)">
                  {stats.progress}%
                </span>
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
            {/* Special TCD Alert */}
            {isTCD && (
              <div className="bg-(--tcd-dash-bg) border border-(--tcd-dash-border) text-(--tcd-dash-text) p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <Info size={20} className="mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">TCD Program Requirements</h4>
                  <p className="text-xs mt-1 opacity-90">
                    This endorsement requires coursework at the <strong>Technical College of DuPage (TCD)</strong>. 
                    Participation requires a separate application and will take up 4 periods of your daily high school schedule.
                  </p>
                  <a aria-label="View information in Schoolinks button" href="https://app.schoolinks.com/course-catalog/naperville-community-unit-school-district-203/overview/technology-center-of-dupage" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-white text-(--tcd-dash-text) rounded-md border border-(--tcd-dash-border) text-xs font-medium hover:bg-gray-50 transition-colors">
                      View More Information <ExternalLink size={12} />
                    </a>
                </div>
              </div>
            )}
            {/* Warning if credits are met but academic success isn't */}
            {stats.progress === 100 && !globalReqsMet && (
              <div className="bg-(--status-warning-light) border border-(--status-warning)/30 text-(--status-warning-text) p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-base">
                    Pathway Credits Completed!
                  </h4>
                  <p className="text-sm mt-1 opacity-90">
                    You have finished all required courses for this pathway, but
                    you still need to complete your{" "}
                    <strong>Academic Success Requirements</strong> on the
                    dashboard to officially earn this endorsement.
                  </p>
                </div>
              </div>
            )}

            {/* Required Courses */}
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
                </div>
                <span className="text-base font-semibold text-(--text-secondary)">
                  {pathway.requirements.courseCredits.requiredCourses.reduce(
                    (sum: number, c: Course) => sum + (c.completed ? c.credits : 0),
                    0
                  )}{" "}
                  credits earned
                </span>
              </div>
              <div className="p-2 space-y-1">
                {pathway.requirements.courseCredits.requiredCourses.map(
                  (course: any, idx: number) => (
                    <label
                      key={`req-${idx}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--bg-soft) cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={course.completed ?? false}
                        onChange={(e) =>
                          onCourseToggle("required", idx, e.target.checked)
                        }
                        className="w-5 h-5 rounded border-(--border-primary) text-(--brand) focus:ring-(--brand) cursor-pointer"
                        aria-label="Check/uncheck class requirement"
                      />
                      <div className="flex-1 flex justify-between items-center gap-3">
                        <span className="text-base text-(--text-primary) flex items-center gap-2 leading-tight">
                          <span
                            className={
                              course.completed
                                ? "line-through text-(--text-secondary) decoration-1"
                                : "text-(--text-primary)"
                            }
                          >
                            {course.name}
                          </span>
                          {course.earlyCollegeCredit && (
                            <span className="text-xs bg-(--badge-college-bg) text-(--badge-college-text) px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                              College Credit
                            </span>
                          )}
                        </span>
                        <span className="text-sm font-medium text-(--text-secondary)">
                          {course.credits} cr
                        </span>
                      </div>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Elective Courses (Hidden for TCD Pathways) */}
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
                      </div>
                      <span className="text-sm font-semibold text-(--text-secondary)">
                        {pathway.requirements.courseCredits.electiveCourseOptions.reduce((sum: number, c: Course) => sum + (c.completed ? c.credits : 0), 0)} / {pathway.requirements.courseCredits.electiveCreditsRequired} cr
                      </span>
                    </div>
                    
                    {pathway.requirements.courseCredits.electiveCourseOptions.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {pathway.requirements.courseCredits.electiveCourseOptions.map((course: any, idx: number) => (
                          <label
                            key={`elec-${idx}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--bg-soft) cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={course.completed ?? false}
                              onChange={(e) => onCourseToggle('elective', idx, e.target.checked)}
                              className="w-5 h-5 rounded border-(--border-primary) text-(--brand) focus:ring-(--brand) cursor-pointer"
                            />
                            <div className="flex-1 flex justify-between items-center">
                              <span className={`text-sm ${course.completed ? 'line-through text-(--text-secondary)' : 'text-(--text-primary)'}`}>
                                {course.name}
                                {course.earlyCollegeCredit && <span className="ml-2 text-[10px] bg-(--badge-college-bg) text-(--badge-college-text) px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">College Credit</span>}
                              </span>
                              <span className="text-xs font-medium text-(--text-secondary)">{course.credits} cr</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 text-center bg-gray-50/50">
                        <p className="text-sm text-(--text-secondary) italic">No elective credits required for this pathway.</p>
                      </div>
                    )}
                  </div>
                )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-(--border-primary) bg-(--bg-soft) flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-(--text-secondary) font-medium hover:opacity-90 transition-colors"
              aria-label="Cancel button"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-5 py-2 rounded-lg bg-(--brand) text-(--text-on-brand) font-medium hover:opacity-90 transition-colors shadow-sm flex items-center gap-2"
                aria-label="Save changes button"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
