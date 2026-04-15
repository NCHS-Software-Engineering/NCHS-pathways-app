"use client";

import React, { useState } from "react";
import { BookOpen, ChevronRight, Award, CheckSquare, Square } from "lucide-react";
import { AcademicStatus } from "../types";

interface AcademicSuccessActionItemProps {
  requirements: any;
  academicStatus: AcademicStatus;
  setAcademicStatus: React.Dispatch<React.SetStateAction<AcademicStatus>>;
}

export function AcademicSuccessActionItem({
  requirements,
  academicStatus,
  setAcademicStatus,
}: AcademicSuccessActionItemProps) {
  const [showReadingDetails, setShowReadingDetails] = useState(false);
  const [showMathDetails, setShowMathDetails] = useState(false);
  const [showReadingCourses, setShowReadingCourses] = useState(false);
  const [showMathCourses, setShowMathCourses] = useState(false);

  return (
    <div className="mt-6">
      <h4 className="font-semibold text-(--text-primary) text-lg mb-1">
        {requirements.title}
      </h4>
      <p className="text-base text-(--text-secondary) mb-4">
        {requirements.description}
      </p>

      <div className="space-y-4">
        {/* Reading Section */}
        <div className="bg-(--bg-card) border border-(--border-primary) rounded-xl shadow-sm overflow-hidden transition-all">
          <div className="p-4 flex items-center justify-between gap-4">
            <label className="flex items-center gap-4 cursor-pointer flex-1 group">
              <div
                className={`mt-0.5 ${
                  academicStatus.reading ? "text-(--success)" : "text-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={academicStatus.reading}
                  onChange={(e) =>
                    setAcademicStatus((prev) => ({
                      ...prev,
                      reading: e.target.checked,
                    }))
                  }
                />
                {academicStatus.reading ? (
                  <CheckSquare size={24} />
                ) : (
                  <Square size={24} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-(--text-primary)">
                  Reading Competency
                </p>
                <p className="text-sm text-(--text-secondary) mt-0.5">
                  {academicStatus.reading
                    ? "Requirement verified"
                    : "Pending completion"}
                </p>
              </div>
            </label>
            <button
              onClick={() => setShowReadingDetails(!showReadingDetails)}
              className="p-1 text-(--text-secondary) hover:text-(--text-primary) transition-transform duration-200"
              style={{
                transform: showReadingDetails ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {showReadingDetails && (
            <div className="p-4 border-t border-(--border-primary) bg-(--competency-reading-soft) space-y-4">
              <p className="text-sm text-(--competency-reading-text)">
                Complete one of the following to fulfill this requirement:
              </p>

              {/* Courses Toggle */}
              <div className="bg-(--bg-card) rounded-lg border border-(--competency-reading-border) overflow-hidden shadow-sm">
                <button
                  onClick={() => setShowReadingCourses(!showReadingCourses)}
                  className="w-full flex items-center justify-between p-3 text-base font-medium text-(--text-primary) hover:bg-(--competency-reading-soft) transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen
                      size={18}
                      className="text-(--competency-reading-accent)"
                    />
                    Approved Coursework ({requirements.reading.courseOptions.length}{" "}
                    options)
                  </span>
                  <ChevronRight
                    size={18}
                    className={`transition-transform ${
                      showReadingCourses ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {showReadingCourses && (
                  <div className="p-3 border-t border-(--competency-reading-border) bg-(--bg-soft)">
                    <ul className="list-disc pl-5 space-y-1 text-sm text-(--text-secondary)">
                      {requirements.reading.courseOptions.map((c: string) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Exams */}
              <div className="bg-(--bg-card) rounded-lg border border-(--competency-reading-border) p-3 shadow-sm">
                <h4 className="text-base font-medium text-(--text-primary) mb-2 flex items-center gap-2">
                  <Award size={18} className="text-(--competency-reading-accent)" />{" "}
                  AP Exams
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-(--text-secondary)">
                  {requirements.reading.examOptions.map((e: string) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>

              {/* Test Scores */}
              <div className="bg-(--bg-card) rounded-lg border border-(--competency-reading-border) p-3 shadow-sm">
                <h4 className="text-base font-medium text-(--text-primary) mb-2 flex items-center gap-2">
                  <Award size={18} className="text-(--competency-reading-accent)" />{" "}
                  Standardized Tests
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-(--text-secondary)">
                  {requirements.reading.testScoreOptions.map((e: string) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Math Section */}
        <div className="bg-(--bg-card) border border-(--border-primary) rounded-xl shadow-sm overflow-hidden transition-all">
          <div className="p-4 flex items-center justify-between gap-4">
            <label className="flex items-center gap-4 cursor-pointer flex-1 group">
              <div
                className={`mt-0.5 ${
                  academicStatus.math ? "text-(--success)" : "text-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={academicStatus.math}
                  onChange={(e) =>
                    setAcademicStatus((prev) => ({
                      ...prev,
                      math: e.target.checked,
                    }))
                  }
                />
                {academicStatus.math ? (
                  <CheckSquare size={24} />
                ) : (
                  <Square size={24} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-(--text-primary)">
                  Math Competency
                </p>
                <p className="text-sm text-(--text-secondary) mt-0.5">
                  {academicStatus.math ? "Requirement verified" : "Pending completion"}
                </p>
              </div>
            </label>
            <button
              onClick={() => setShowMathDetails(!showMathDetails)}
              className="p-1 text-(--text-secondary) hover:text-(--text-primary) transition-transform duration-200"
              style={{
                transform: showMathDetails ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {showMathDetails && (
            <div className="p-4 border-t border-(--border-primary) bg-(--competency-math-soft) space-y-4">
              <p className="text-sm text-(--competency-math-text)">
                Complete one of the following to fulfill this requirement:
              </p>

              {/* Courses Toggle */}
              <div className="bg-(--bg-card) rounded-lg border border-(--competency-math-border) overflow-hidden shadow-sm">
                <button
                  onClick={() => setShowMathCourses(!showMathCourses)}
                  className="w-full flex items-center justify-between p-3 text-base font-medium text-(--text-primary) hover:bg-(--competency-math-soft) transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen
                      size={18}
                      className="text-(--competency-math-accent)"
                    />
                    Approved Coursework ({requirements.math.courseOptions.length}{" "}
                    options)
                  </span>
                  <ChevronRight
                    size={18}
                    className={`transition-transform ${
                      showMathCourses ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {showMathCourses && (
                  <div className="p-3 border-t border-(--competency-math-border) bg-(--bg-soft)">
                    <ul className="list-disc pl-5 space-y-1 text-sm text-(--text-secondary)">
                      {requirements.math.courseOptions.map((c: string) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Exams */}
              <div className="bg-(--bg-card) rounded-lg border border-(--competency-math-border) p-3 shadow-sm">
                <h4 className="text-base font-medium text-(--text-primary) mb-2 flex items-center gap-2">
                  <Award size={18} className="text-(--competency-math-accent)" /> AP
                  Exams
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-(--text-secondary)">
                  {requirements.math.examOptions.map((e: string) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>

              {/* Test Scores */}
              <div className="bg-(--bg-card) rounded-lg border border-(--competency-math-border) p-3 shadow-sm">
                <h4 className="text-base font-medium text-(--text-primary) mb-2 flex items-center gap-2">
                  <Award size={18} className="text-(--competency-math-accent)" />{" "}
                  Standardized Tests
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-(--text-secondary)">
                  {requirements.math.testScoreOptions.map((e: string) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
