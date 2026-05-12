"use client";

import React from "react";
import { Award, BookOpen, AlertCircle } from "lucide-react";

interface QuickStatsProps {
  activeEndorsements: number;
  totalCreditsEarned: number;
  pendingActionsCount: number;
}

export function QuickStats({
  activeEndorsements,
  totalCreditsEarned,
  pendingActionsCount,
}: QuickStatsProps) {
  const allClear = pendingActionsCount === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-(--brand-soft) rounded-xl p-5 border border-(--border-primary) flex items-center gap-4">
        <div className="bg-(--brand) text-(--text-on-brand) p-3 rounded-lg">
          <Award size={24} />
        </div>
        <div>
          <p className="text-base font-medium text-(--brand-text)">
            Active Endorsements
          </p>
          <p className="text-2xl font-bold text-(--text-primary)">
            {activeEndorsements}
          </p>
        </div>
      </div>

      <div className="bg-(--bg-card) rounded-xl p-5 border border-(--border-primary) flex items-center gap-4">
        <div className="bg-(--credits-icon-bg) text-(--credits-icon-text) p-3 rounded-lg">
          <BookOpen size={24} />
        </div>
        <div>
          <p className="text-base font-medium text-(--text-secondary)">
            Total Credits Earned
          </p>
          <p className="text-2xl font-bold text-(--text-primary)">
            {totalCreditsEarned}
          </p>
        </div>
      </div>

      <div
        className={`${
          allClear ? "bg-(--badge-success-bg)" : "bg-(--status-warning-light)"
        } rounded-xl p-5 border border-(--border-primary) flex items-center gap-4`}
      >
        <div
          className={`${
            allClear ? "bg-(--success)" : "bg-(--status-warning)"
          } text-white p-3 rounded-lg`}
        >
          <AlertCircle size={24} />
        </div>
        <div>
          <p
            className={`text-base font-medium ${
              allClear
                ? "text-(--badge-success-text)"
                : "text-(--status-warning-text)"
            }`}
          >
            {allClear ? "All Set" : "Pending Actions"}
          </p>
          <p
            className={`text-2xl font-bold ${
              allClear
                ? "text-(--badge-success-text)"
                : "text-(--status-warning-text)"
            }`}
          >
            {pendingActionsCount}
          </p>
        </div>
      </div>
    </div>
  );
}
