"use client";

import React from "react";
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
} from "lucide-react";
import { Pathway, PathwayStats } from "../types";
import { getPathwayStats } from "../utils";
import { pathways as canonicalPathways } from "../../data/pathways";

const canonicalPathwayKeyById = Object.entries(canonicalPathways).reduce<
  Record<string, string>
>((acc, [key, value]) => {
  acc[key] = key;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string") {
      acc[id] = key;
    }
  }
  return acc;
}, {});

interface PathwaysListProps {
  starredPathways: string[];
  pathways: Record<string, any>;
  onPathwayClick: (pathwayKey: string) => void;
  globalReqsMet: boolean;
}

export function PathwaysList({
  starredPathways,
  pathways,
  onPathwayClick,
  globalReqsMet,
}: PathwaysListProps) {
  if (starredPathways.length === 0) {
    return (
      <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-6 self-start">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-serif font-bold text-(--text-primary) flex items-center gap-2">
              My Selected Pathways
            </h3>
            <p className="text-base text-(--text-secondary) mt-1">
              Click on a pathway to view detailed requirements and log your
              courses.
            </p>
            <a
              href="/endorsements"
              className="text-base font-medium text-(--link) hover:underline hidden sm:block"
              aria-label="Browse more endorsements"
            >
              Browse More Endorsements &rarr;
            </a>
          </div>
        </div>

        <div className="bg-(--bg-card) rounded-xl border border-(--border-primary) p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="bg-(--bg-soft) p-4 rounded-full text-(--text-secondary)">
            <BookOpen size={32} />
          </div>
          <div>
            <h4 className="font-medium text-lg text-(--text-primary)">
              No Pathways Selected
            </h4>
            <p className="text-(--text-secondary) mt-1 max-w-sm mx-auto">
              You haven't added any pathway endorsements yet. Explore available
              pathways to start tracking.
            </p>
          </div>
          <button aria-label="Explore endorsements" className="mt-4 px-6 py-2.5 rounded-lg bg-(--brand) text-(--text-on-brand) font-medium hover:opacity-90 transition-colors shadow-sm">
            <a aria-label="Explore endorsements" href="/endorsements" className="flex items-center gap-2">
              Explore Endorsements
            </a>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-6 self-start">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-serif font-bold text-(--text-primary) flex items-center gap-2">
            My Selected Pathways
          </h3>
          <p className="text-base text-(--text-secondary) mt-1">
            Click on a pathway to view detailed requirements and log your
            courses.
          </p>
          <a
            href="/endorsements"
            className="text-base font-medium text-(--link) hover:underline hidden sm:block"
            aria-label="Go to endorsements"
          >
            Browse More Endorsements &rarr;
          </a>
        </div>
      </div>

      <div className="space-y-4">
        {starredPathways.map((key) => {
          const pathwayData = pathways[key as keyof typeof pathways];
          if (!pathwayData) return null;

          const canonicalKey = canonicalPathwayKeyById[key] ?? null;
          const canonicalPathway = canonicalKey
            ? canonicalPathways[canonicalKey as keyof typeof canonicalPathways]
            : null;
          const isTCDPathway = Boolean(canonicalPathway?.tcd ?? pathwayData.tcd);

          const stats = getPathwayStats(pathwayData as Pathway);
          const allCoursesComplete = stats.progress === 100;

          return (
            <div
              key={key}
              className="group bg-(--bg-card) rounded-xl border border-(--border-primary) p-5 md:p-6 hover:shadow-md hover:border-(--brand) transition-all duration-200 cursor-pointer shadow-sm"
              onClick={() => onPathwayClick(key)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-bold text-(--text-primary)">
                      {pathwayData.title}
                    </h4>
                    {allCoursesComplete && globalReqsMet ? (
                      <span className="bg-(--badge-success-bg) text-(--badge-success-text) text-sm px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 border border-(--status-complete)/20">
                        <Award size={14} /> Endorsement Earned
                      </span>
                    ) : allCoursesComplete ? (
                      <span className="bg-(--brand-soft) text-(--brand-text) text-sm px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 border border-(--brand)/20">
                        <BookOpen size={14} /> Credits Met
                      </span>
                    ) : isTCDPathway ? (
                      <span className="bg-(--tcd-dash-bg) text-(--tcd-dash-text) text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-(--tcd-dash-border)">
                        <Award size={12} /> TCD Program
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="bg-(--bg-soft) group-hover:bg-(--brand-soft) group-hover:text-(--brand) p-2 rounded-full transition-colors text-(--text-secondary) ml-2">
                  <ChevronRight size={20} />
                </div>
              </div>

              {/* Mini Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-base">
                  <span className="text-(--status-warning-text) font-medium">
                    Progress Overview
                  </span>
                  <span className="font-bold text-(--status-warning-text) ">{stats.progress}%</span>
                </div>
                <div className="w-full bg-(--bg-soft) h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stats.progress === 100
                        ? "bg-(--success)"
                        : "bg-(--modal-progress-incomplete)"
                    }`}
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-(--border-primary) text-base">
                  <div className="flex items-center gap-1.5 text-(--status-warning-text) font-medium">
                    {allCoursesComplete ? (
                      <CheckCircle2 size={16} className="text-(--status-complete)" />
                    ) : (
                      <Clock size={16} className="text-(--status-warning-icon)" />
                    )}
                    <span>
                      {stats.earnedCredits} / {stats.totalCredits} Pathway Credits
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-(--status-warning-text) font-medium">
                    {globalReqsMet ? (
                      <CheckCircle2 size={16} className="text-(--status-complete)" />
                    ) : (
                      <AlertCircle size={16} className="text-(--status-warning-icon)" />
                    )}
                    <span
                      className={
                        globalReqsMet ? "" : "text-(--status-warning-text) font-medium"
                      }
                    >
                      {globalReqsMet
                        ? "Academic Success Met"
                        : "Missing Academic Success"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
