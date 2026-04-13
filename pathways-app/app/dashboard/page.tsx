"use client";
import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Upload,
  Clock,
  Award,
  Info,
  Save
} from "lucide-react";

import { useSession } from "next-auth/react";



import { pathways as pathwaysData } from "../data/pathways";

const STARRED_PATHWAYS_STORAGE_KEY = "starredPathways";
const PATHWAY_PROGRESS_STORAGE_KEY = "pathwayProgress";

interface Course {
  name: string;
  credits: number;
  earlyCollegeCredit: boolean;
  completed?: boolean;
}
interface Pathway {
  id: string;
  title: string;
  category: string;
  requirements: {
    pathwayType: string;
    courseCredits: {
      totalCreditsRequired: number;
      requiredCourses: Course[];
      electiveCreditsRequired: number;
      electiveCourseOptions: Course[];
    };
    [key: string]: any;
  };
  [key: string]: any; // Allow additional properties from pathways data
}

export default function App() {
  const [pathways, setPathways] = useState(pathwaysData);
  const [showModal, setShowModal] = useState(false);
  const [activePathway, setActivePathway] = useState<Pathway | null>(null);
  const [activePathwayKey, setActivePathwayKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'scores'>('courses');
  const [starredPathways, setStarredPathways] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    const savedStarred = localStorage.getItem(STARRED_PATHWAYS_STORAGE_KEY);
    const savedProgress = localStorage.getItem(PATHWAY_PROGRESS_STORAGE_KEY);

    try {
      if (savedStarred) {
        const parsed = JSON.parse(savedStarred);
        if (Array.isArray(parsed)) {
          const validPathways = parsed.filter(
            (key): key is string => typeof key === "string" && key in pathwaysData
          );

          setStarredPathways(validPathways);
        }
      }

      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);

        if (parsedProgress && typeof parsedProgress === "object") {
          const validProgressEntries = Object.entries(parsedProgress).filter(
            ([key, value]) => key in pathwaysData && value && typeof value === "object"
          );

          if (validProgressEntries.length > 0) {
            setPathways((prevPathways) => ({
              ...prevPathways,
              ...Object.fromEntries(validProgressEntries)
            }));
          }
        }
      }
    } catch {
      // Ignore invalid localStorage values and fall back to defaults.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(PATHWAY_PROGRESS_STORAGE_KEY, JSON.stringify(pathways));
  }, [pathways, isHydrated]);

  function openPathway(pathwayKey: string) {
    const pathwayData = pathways[pathwayKey as keyof typeof pathways];
    if (pathwayData) {
      setActivePathwayKey(pathwayKey);
      setActiveTab('courses');
      // Deep clone to avoid mutating state directly
      setActivePathway(JSON.parse(JSON.stringify(pathwayData)));
    }
    setShowModal(true);
  }

  // Handle checking/unchecking a course in the modal for both required & electives
  function handleCourseToggle(courseType: 'required' | 'elective', index: number, checked: boolean) {
    setActivePathway((prev) => {
      if (!prev) return prev;
      
      const updated = { ...prev };
      const creditsData = updated.requirements.courseCredits;

      if (courseType === 'required') {
        creditsData.requiredCourses[index].completed = checked;
      } else {
        creditsData.electiveCourseOptions[index].completed = checked;
      }

      return updated;
    });
  }

  // Handle saving the changes made in the modal
  function handleSave() {
    if (activePathway && activePathwayKey) {
      setPathways((prevPathways: typeof pathways) => ({
        ...prevPathways,
        [activePathwayKey]: activePathway
      }));
      setShowModal(false);
    }
  }

  // Helper to calculate progress for a pathway dynamically based on the new JSON
  function getPathwayStats(pathway: Pathway) {
    const req = pathway.requirements.courseCredits;
    const earnedReq = req.requiredCourses.reduce((sum: number, c: Course) => sum + (c.completed ? c.credits : 0), 0);
    const earnedElec = req.electiveCourseOptions.reduce((sum: number, c: Course) => sum + (c.completed ? c.credits : 0), 0);
    
    const earnedCredits = earnedReq + earnedElec;
    // Calculate progress % based on total credits required (capped at 100%)
    const progress = Math.min(100, Math.round((earnedCredits / req.totalCreditsRequired) * 100));
    
    return { earnedCredits, totalCredits: req.totalCreditsRequired, progress, earnedReq, earnedElec };
  }

  const totalEarnedCredits = starredPathways.reduce((sum, key) => {
    const pathway = pathways[key as keyof typeof pathways] as Pathway | undefined;
    if (!pathway) return sum;
    return sum + getPathwayStats(pathway).earnedCredits;
  }, 0);

  return (
    <div className="min-h-screen w-full font-sans bg-(--bg-primary) text-(--text-primary)">
      <div className="w-full min-h-screen px-12 py-4 md:px-14 md:py-8 space-y-8 flex flex-col max-w-412.5 mx-auto">
        {/* Header Section */}
        <header className="space-y-2 border-b border-(--border-primary) pb-6">
          <div className="flex items-center gap-3 text-(--modal-accent-text) mb-2">
            <GraduationCap size={28} />
            <span className="font-semibold tracking-wider uppercase text-sm">Student Portal</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-(--text-primary)">
            Welcome back, {session?.user?.name || "Student"}
          </h2>
          <p className="text-(--text-secondary) text-lg max-w-2xl">
            Track your progress toward your high school diploma endorsements. Review your action items and pathway requirements below.
          </p>
        </header>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-(--brand-soft) rounded-xl p-5 border border-(--border-primary) flex items-center gap-4">
            <div className="bg-(--brand) text-(--text-on-brand) p-3 rounded-lg">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-(--brand-text)">Active Endorsements</p>
              <p className="text-2xl font-bold text-(--text-primary)">{starredPathways.length}</p>
            </div>
          </div>
          <div className="bg-(--bg-card) rounded-xl p-5 border border-(--border-primary) flex items-center gap-4 ">
            <div className="bg-(--credits-icon-bg) text-(--credits-icon-text) p-3 rounded-lg">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-(--text-secondary)">Total Credits Earned</p>
              <p className="text-2xl font-bold text-(--text-primary)">{totalEarnedCredits}</p>
            </div>
          </div>
            <div className="bg-(--status-warning-light) rounded-xl p-5 border border-(--border-primary) flex items-center gap-4">
            <div className="bg-(--status-warning) text-white p-3 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-(--status-warning-text)">Pending Actions</p>
              <p className="text-2xl font-bold text-(--status-warning-text)">1</p>
            </div>
            </div>
          </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Pathways */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-serif font-bold text-(--text-primary) flex items-center gap-2">
                  My Selected Pathways
                </h3>
                <p className="text-sm text-(--text-secondary) mt-1">
                  Click on a pathway to view detailed requirements and log your courses.
                </p>
              </div>
              <a href="/endorsements" className="text-sm font-medium text-(--link) hover:underline hidden sm:block">
                Browse More Endorsements &rarr;
              </a>
            </div>

            {starredPathways.length === 0 ? (
              <div className="bg-(--bg-card) rounded-xl border border-(--border-primary) p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
                <div className="bg-(--bg-soft) p-4 rounded-full text-(--text-secondary)">
                  <BookOpen size={32} />
                </div>
                <div>
                  <h4 className="font-medium text-lg text-(--text-primary)">No Pathways Selected</h4>
                  <p className="text-(--text-secondary) mt-1 max-w-sm mx-auto">
                    You haven't added any pathway endorsements yet. Explore available pathways to start tracking.
                  </p>
                </div>
                <button className="mt-4 px-6 py-2.5 rounded-lg bg-(--brand) text-(--text-on-brand) font-medium hover:opacity-90 transition-colors shadow-sm">
                  <a href="/endorsements" className="flex items-center gap-2">
                    Explore Endorsements
                  </a>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {starredPathways.map((key) => {
                  const pathwayData = pathways[key as keyof typeof pathwaysData];
                  if (!pathwayData) return null;

                  const stats = getPathwayStats(pathwayData as Pathway & { requirements: { courseCredits: { totalCreditsRequired: number; requiredCourses: Course[]; electiveCourseOptions: Course[] } } });
                  const allCoursesComplete = stats.progress === 100;

                  return (
                    <div
                      key={key}
                      className="group bg-(--bg-card) rounded-xl border border-(--border-primary) p-5 md:p-6 hover:shadow-md hover:border-(--brand) transition-all duration-200 cursor-pointer shadow-sm"
                      onClick={() => openPathway(key)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-lg font-bold text-(--text-primary)">{pathwayData.title}</h4>
                              {allCoursesComplete && (
                                <span className="bg-(--badge-success-bg) text-(--badge-success-text) text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Completed
                                </span>
                              )}
                            </div>
                          </div>
                        <div className="bg-(--bg-soft) group-hover:bg-(--brand-soft) group-hover:text-(--brand) p-2 rounded-full transition-colors text-(--text-secondary) ml-2">
                          <ChevronRight size={20} />
                        </div>
                      </div>

                      {/* Mini Progress Indicator */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-(--text-secondary)">Progress Overview</span>
                          <span className="font-bold text-(--brand)">{stats.progress}%</span>
                        </div>
                        <div className="w-full bg-(--bg-soft) h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${stats.progress === 100 ? 'bg-(--success)' : 'bg-(--modal-progress-incomplete)'}`}
                            style={{ width: `${stats.progress}%` }} 
                          />
                        </div>
                        <div className="flex gap-4 mt-3 pt-3 border-t border-(--border-primary) text-sm">
                          <div className="flex items-center gap-1.5 text-(--text-secondary)">
                            {allCoursesComplete ? <CheckCircle2 size={16} className="text-(--status-complete)" /> : <Clock size={16} className="text-(--status-warning)" />}
                            <span>{stats.earnedCredits} / {stats.totalCredits} Credits</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Action Items */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-(--text-primary) flex items-center gap-2">
              Action Items
            </h3>
            
            <div className="bg-(--bg-card) rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
              <div className="bg-(--bg-soft) px-5 py-3 border-b border-(--border-primary)">
                <h4 className="font-semibold text-(--text-primary) text-sm uppercase tracking-wider">Required Tasks</h4>
              </div>
              
              <div className="divide-y divide-(--border-primary)">
                {/* Task 1: Pending */}
                <div className="p-5 hover:bg-(--bg-soft) transition-colors">
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-(--status-warning)">
                      <AlertCircle size={20} />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div>
                        <h5 className="font-medium text-(--text-primary)">Submit Scores</h5>
                        <p className="text-sm text-(--text-secondary) mt-1">
                          We need your latest academic success scores to verify your endorsement eligibility.
                        </p>
                      </div>
                      <a
                        href="#upload"
                        className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-(--brand) hover:opacity-90 text-(--text-on-brand) text-sm font-medium transition-colors shadow-sm"
                      >
                        <Upload size={16} />
                        Submit Documents
                      </a>
                    </div>
                  </div>
                </div>

                {/* Task 2: Completed */}
                <div className="p-5">
                  <div className="flex gap-3">
                    <div className={`mt-0.5 ${starredPathways.length > 0 ? 'text-(--status-complete)' : 'text-(--status-warning)'}`}>
                      {starredPathways.length > 0 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div className="space-y-2 flex-1">
                      <h5 className={`font-medium ${starredPathways.length > 0 ? 'line-through text-(--text-secondary)' : 'text-(--text-primary)'}`}>
                        Select Initial Pathways
                      </h5>
                      <p className="text-sm mt-1 text-(--text-secondary)">
                        {starredPathways.length > 0 
                          ? "You've selected your first endorsement track." 
                          : "Choose at least one diploma endorsement track."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpful Academic Tip Card */}
            <div className="bg-(--chip-bg) opacity-85 rounded-xl p-5 border border-(--border-primary) flex gap-3 text-(--chip-text)">
              <Info size={20} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">Did you know?</h4>
                <p className="text-xs leading-relaxed opacity-90">
                  Completing multiple endorsements can make you more competitive for college admissions. You can track up to 3 simultaneously!
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Pathway Details Modal */}
      {showModal && activePathway && (
        <div 
          className="fixed inset-0 bg-(--overlay-backdrop) backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-(--bg-card) rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 pt-5 bg-(--bg-card)">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-(--modal-accent-text) mb-1 block">Endorsement Details</span>
                  <h2 className="text-2xl font-serif font-bold text-(--text-primary)">{activePathway.title}</h2>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-soft) hover:opacity-90 rounded-full p-2 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-(--border-primary)">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'courses' ? 'border-(--modal-accent-text) text-(--modal-accent-text)' : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'}`}
                >
                  Courses
                </button>
                <button
                  onClick={() => setActiveTab('scores')}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'scores' ? 'border-(--modal-accent-text) text-(--modal-accent-text)' : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'}`}
                >
                  Test Scores
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Overall Progress (Always visible) */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-(--text-primary)">Overall Completion</span>
                  <span className="font-bold text-(--modal-accent-text)">{activePathway ? getPathwayStats(activePathway).progress : 0}%</span>
                </div>
                <div className="w-full bg-(--bg-soft) h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${activePathway && getPathwayStats(activePathway).progress === 100 ? 'bg-(--success)' : 'bg-(--modal-progress-incomplete)'}`}
                    style={{ width: `${activePathway ? getPathwayStats(activePathway).progress : 0}%` }} 
                  />
                </div>
              </div>

              {/* Tab Content: Courses */}
              {activeTab === 'courses' && (
                <div className="space-y-6">
                  {/* Required Courses */}
                  <div className="border border-(--border-primary) rounded-xl overflow-hidden bg-(--bg-card)">
                    <div className="p-4 border-b border-(--border-primary) bg-(--bg-soft) flex justify-between items-center">
                       <div>
                         <h4 className="font-medium text-(--text-primary) flex items-center gap-2">
                           <BookOpen size={18} className="text-(--brand)" />
                           Required Courses
                         </h4>
                         <p className="text-xs text-(--text-secondary) mt-1">Check off classes you have completed.</p>
                       </div>
                       <span className="text-sm font-semibold text-(--text-secondary)">
                         {activePathway.requirements.courseCredits.requiredCourses.reduce((sum, c) => sum + (c.completed ? c.credits : 0), 0)} credits earned
                       </span>
                    </div>
                    <div className="p-2 space-y-1">
                      {activePathway.requirements.courseCredits.requiredCourses.map((course: any, idx: number) => (
                        <label
                          key={`req-${idx}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--bg-soft) cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={course.completed ?? false}
                            onChange={(e) => handleCourseToggle('required', idx, e.target.checked)}
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
                  </div>

                  {/* Elective Courses */}
                  <div className="border border-(--border-primary) rounded-xl overflow-hidden bg-(--bg-card)">
                    <div className="p-4 border-b border-(--border-primary) bg-(--bg-soft) flex justify-between items-center">
                       <div>
                         <h4 className="font-medium text-(--text-primary) flex items-center gap-2">
                           <GraduationCap size={18} className="text-(--brand)" />
                           Elective Options
                         </h4>
                         <p className="text-xs text-(--text-secondary) mt-1">
                           {activePathway.requirements.courseCredits.electiveCreditsRequired} elective credits required.
                         </p>
                       </div>
                       <span className="text-sm font-semibold text-(--text-secondary)">
                         {activePathway.requirements.courseCredits.electiveCourseOptions.reduce((sum, c) => sum + (c.completed ? c.credits : 0), 0)} / {activePathway.requirements.courseCredits.electiveCreditsRequired} cr
                       </span>
                    </div>
                    <div className="p-2 space-y-1">
                      {activePathway.requirements.courseCredits.electiveCourseOptions.map((course: any, idx: number) => (
                        <label
                          key={`elec-${idx}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--bg-soft) cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={course.completed ?? false}
                            onChange={(e) => handleCourseToggle('elective', idx, e.target.checked)}
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
                  </div>
                </div>
              )}

              {/* Tab Content: Test Scores */}
              {activeTab === 'scores' && (
                <div className="border border-(--border-primary) rounded-xl overflow-hidden">
                  <div className="p-4 flex items-start gap-4 bg-(--bg-card)">
                    <div className={`p-2 rounded-full mt-1 ${!activePathway.testPending ? 'bg-(--bg-soft) text-(--status-complete)' : 'bg-(--bg-soft) text-(--status-warning)'}`}>
                      {!activePathway.testPending ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-(--text-primary)">Standardized Test Scores</h4>
                      <p className="text-sm text-(--text-secondary) mt-1">
                        {!activePathway.testPending 
                          ? "Required scores have been verified." 
                          : "Pending verification. Please upload your latest score report."}
                      </p>
                      {activePathway.testPending && (
                         <a href="#upload" className="mt-3 text-sm font-medium text-(--link) hover:underline flex items-center gap-1 w-fit">
                           Upload Scores Now <ChevronRight size={14} />
                         </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-(--border-primary) bg-(--bg-soft) flex justify-between items-center">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-(--text-secondary) font-medium hover:opacity-90 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-(--brand) text-(--text-on-brand) font-medium hover:opacity-90 transition-colors shadow-sm flex items-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}