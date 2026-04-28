"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { AcademicSuccessActionItem } from "./AcademicSuccessActionItem";
import { AcademicStatus } from "../types";

interface ActionItemsProps {
  starredPathways: string[];
  academicStatus: AcademicStatus;
  setAcademicStatus: React.Dispatch<React.SetStateAction<AcademicStatus>>;
  academicSuccessData: any;
}

export function ActionItems({
  starredPathways,
  academicStatus,
  setAcademicStatus,
  academicSuccessData,
}: ActionItemsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-serif font-bold text-(--text-primary) flex items-center gap-2">
        Action Items
      </h3>

      <div className="bg-(--bg-card) rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="bg-(--bg-soft) px-5 py-3 border-b border-(--border-primary)">
          <h4 className="font-semibold text-(--text-primary) text-base uppercase tracking-wider">
            Required Tasks
          </h4>
        </div>

        {/* Task 1: Select Initial Pathways */}
        <div className="p-5">
          <div className="flex gap-3">
            <div
              className={`mt-0.5 ${starredPathways.length > 0
                  ? "text-(--status-complete)"
                  : "text-(--status-warning)"
                }`}
            >
              {starredPathways.length > 0 ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>
            <div className="space-y-2 flex-1">
              <h5
                className={`font-medium ${starredPathways.length > 0
                    ? "line-through text-(--text-secondary)"
                    : "text-(--text-primary)"
                  }`}
              >
                Select Initial Pathways
              </h5>
              <p className="text-base mt-1 text-(--text-secondary)">
                {starredPathways.length > 0
                  ? "You've selected your first endorsement track."
                  : "Choose at least one diploma endorsement track."}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-(--border-primary)"></div>

        {/* Academic Success Checklist */}
        <div className="p-5">
          <AcademicSuccessActionItem
            requirements={academicSuccessData}
            academicStatus={academicStatus}
            setAcademicStatus={setAcademicStatus}
          />
        </div>
      </div>

      {/* Did You Know chip */}
      <div className="bg-(--chip-bg) rounded-xl p-5 border border-(--border-primary) flex gap-3 text-(--chip-text)">
        <Info size={20} className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-base mb-1">Did you know?</h4>
          <p className="text-sm leading-relaxed opacity-90">
            Completing multiple endorsements can make you more competitive for
            college admissions. You can track up to 3 simultaneously!
          </p>
        </div>
      </div>

      <div className="bg-(--chip-bg) rounded-xl p-5 border border-(--border-primary) flex gap-3 text-(--chip-text)">
        <Info size={20} className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-base mb-1">A link to Schoolinks's assessment survey</h4>
          <p className="text-sm leading-relaxed opacity-90">
            Take your surveys at{" "}
            <a href="https://app.schoolinks.com/assessments" className="underline">
              app.schoolinks.com/assessments
            </a>
          </p>
        </div>
      </div>
    </div >
  );
}