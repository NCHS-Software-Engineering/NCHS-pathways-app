import { ArrowLeft, BookOpen, Briefcase, GraduationCap, Plus, Save, Trash2 } from "lucide-react";
import { Course, Pathway } from "../types";

interface PathwayEditorViewProps {
  editingPathway: Pathway;
  isNewPathway: boolean;
  errorMessage: string;
  onBack: () => void;
  onSave: () => void;
  onPathwayBasicChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onProfLearningMethodChange: (method: "embedded" | "internship") => void;
  onManageCourse: (
    action: "add" | "remove" | "update",
    type: "required" | "elective",
    index?: number,
    field?: keyof Course,
    value?: string | number | boolean
  ) => void;
  onTotalCreditsChange: (value: number) => void;
  onElectiveCreditsChange: (value: number) => void;
}

export default function PathwayEditorView({
  editingPathway,
  isNewPathway,
  errorMessage,
  onBack,
  onSave,
  onPathwayBasicChange,
  onProfLearningMethodChange,
  onManageCourse,
  onTotalCreditsChange,
  onElectiveCreditsChange
}: PathwayEditorViewProps) {
  const categoryOptions = [
    { value: "STEM", label: "STEM" },
    { value: "Business", label: "Financial Services" },
    { value: "Manufacturing", label: "Marketing & Sales" },
    { value: "Construction", label: "Management & Entreprenuership" },
    { value: "Arts", label: "Digital Technology" },
    { value: "Public Services", label: "Public Service & Safety" },
    { value: "Healthcare & Human Services", label: "Healthcare & Human Services" },
    { value: "Agriculture", label: "Agriculture" }
  ];

  const categoryOptionValues = categoryOptions.map((option) => option.value);
  const isCustomCategory =
    editingPathway.category.trim().length > 0 &&
    editingPathway.category !== "Other" &&
    !categoryOptionValues.includes(editingPathway.category);
  const selectedCategoryValue = isCustomCategory ? "Other" : editingPathway.category;

  return (
    <div className="space-y-7 text-[1.02rem] animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-(--border-primary)">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-(--text-secondary) hover:text-(--text-primary) font-medium"
        >
          <ArrowLeft size={18} /> Back to Database
        </button>
        <div className="flex items-center gap-4">
          {errorMessage && <span className="text-(--danger) text-sm font-medium animate-in fade-in">{errorMessage}</span>}
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 bg-(--brand) hover:opacity-90 text-white px-7 py-3 rounded-lg font-medium transition-all shadow-sm"
          >
            <Save size={18} /> Save to Database
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="bg-(--bg-card) rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
          <div className="bg-(--bg-soft) px-6 py-4 border-b border-(--border-primary) flex items-center gap-2">
            <GraduationCap size={20} className="text-(--text-primary)" />
            <h2 className="font-semibold text-xl">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--text-secondary)">Pathway Title</label>
              <input
                type="text"
                name="title"
                value={editingPathway.title}
                onChange={onPathwayBasicChange}
                className="w-full px-4 py-2 rounded-lg border border-(--border-primary) focus:outline-none focus:ring-2 focus:ring-(--brand)/50"
                placeholder="e.g. Cosmetology"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--text-secondary)">Unique ID</label>
              <input
                type="text"
                name="id"
                value={editingPathway.id}
                onChange={onPathwayBasicChange}
                disabled={!isNewPathway}
                className="w-full px-4 py-2 rounded-lg border border-(--border-primary) bg-(--admin-field-bg) focus:outline-none focus:ring-2 focus:ring-(--brand)/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--text-secondary)">Category</label>
              <select
                name="category"
                value={selectedCategoryValue}
                onChange={onPathwayBasicChange}
                className="w-full px-4 py-2 rounded-lg border border-(--border-primary) focus:outline-none focus:ring-2 focus:ring-(--brand)/50"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {selectedCategoryValue === "Other" && (
                <input
                  type="text"
                  name="category"
                  value={editingPathway.category === "Other" ? "" : editingPathway.category}
                  onChange={onPathwayBasicChange}
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-(--border-primary) focus:outline-none focus:ring-2 focus:ring-(--brand)/50"
                  placeholder="Type custom category"
                />
              )}
            </div>

            <div className="col-span-1 md:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-(--border-primary) rounded-lg hover:bg-(--admin-soft-hover) transition-colors">
                <input
                  type="checkbox"
                  name="tcd"
                  checked={editingPathway.tcd}
                  onChange={onPathwayBasicChange}
                  className="w-5 h-5 rounded border-gray-300 text-(--brand) focus:ring-(--brand)"
                />
                <div>
                  <p className="font-bold text-(--text-primary)">TCD (Technical College of DuPage) Program</p>
                  <p className="text-xs text-(--text-secondary)">Checking this removes the ability to add electives.</p>
                </div>
              </label>
            </div>
          </div>
        </section>

        <section className="bg-(--bg-card) rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
          <div className="bg-(--bg-soft) px-6 py-4 border-b border-(--border-primary) flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-(--text-primary)" />
              <h2 className="font-semibold text-xl">Course Requirements</h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-(--text-secondary)">Total Credits Required:</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={editingPathway.requirements.courseCredits.totalCreditsRequired}
                onChange={(e) => onTotalCreditsChange(Number(e.target.value))}
                className="w-20 px-3 py-1 rounded-md border border-(--border-primary) font-bold text-center"
              />
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="font-medium text-(--text-primary)">Required Courses</h3>
                <button
                  type="button"
                  onClick={() => onManageCourse("add", "required")}
                  className="flex items-center gap-1 text-sm text-(--text-primary) font-medium hover:underline bg-(--brand-soft) px-2 py-1 rounded"
                >
                  <Plus size={16} /> Add Course
                </button>
              </div>

              <div className="space-y-3">
                {editingPathway.requirements.courseCredits.requiredCourses.length === 0 ? (
                  <p className="text-sm text-(--text-secondary) italic p-4 bg-(--admin-muted-bg) rounded-lg text-center border border-dashed border-(--border-primary)">No required courses added yet.</p>
                ) : (
                  editingPathway.requirements.courseCredits.requiredCourses.map((course, idx) => (
                    <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-(--admin-muted-bg) p-3 rounded-lg border border-(--border-primary)">
                      <input
                        type="text"
                        placeholder="Course Name"
                        value={course.name}
                        onChange={(e) => onManageCourse("update", "required", idx, "name", e.target.value)}
                        className="flex-1 min-w-50 px-3 py-2 rounded border border-(--border-primary) text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-(--text-secondary)">Credits:</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={course.credits}
                          onChange={(e) => onManageCourse("update", "required", idx, "credits", Number(e.target.value))}
                          className="w-16 px-2 py-2 rounded border border-(--border-primary) text-sm text-center"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-(--bg-card) px-3 py-2 rounded border border-(--border-primary)">
                        <input
                          type="checkbox"
                          checked={course.earlyCollegeCredit}
                          onChange={(e) => onManageCourse("update", "required", idx, "earlyCollegeCredit", e.target.checked)}
                          className="rounded text-(--brand)"
                        />
                        <span className="text-xs font-medium whitespace-nowrap">College Credit?</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => onManageCourse("remove", "required", idx)}
                        className="p-2 text-(--text-secondary) hover:text-(--danger) hover:bg-(--danger-soft) rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {!editingPathway.tcd && (
              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium text-(--text-primary)">Elective Options</h3>
                    <div className="flex items-center gap-2 bg-(--admin-accent-soft) px-3 py-1.5 rounded border border-(--admin-accent-border)">
                      <label className="text-xs font-bold text-(--admin-accent-text)">Credits Needed to fulfill Electives:</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={editingPathway.requirements.courseCredits.electiveCreditsRequired}
                        onChange={(e) => onElectiveCreditsChange(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded border border-(--admin-accent-border) text-sm font-bold text-center"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onManageCourse("add", "elective")}
                    className="flex items-center gap-1 text-sm text-(--admin-accent-text) font-medium hover:underline bg-(--admin-accent-soft) px-2 py-1 rounded"
                  >
                    <Plus size={16} /> Add Option
                  </button>
                </div>

                <div className="space-y-3">
                  {editingPathway.requirements.courseCredits.electiveCourseOptions.length === 0 ? (
                    <p className="text-sm text-(--text-secondary) italic p-4 bg-(--admin-muted-bg) rounded-lg text-center border border-dashed border-(--border-primary)">No elective options added.</p>
                  ) : (
                    editingPathway.requirements.courseCredits.electiveCourseOptions.map((course, idx) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-(--admin-muted-bg) p-3 rounded-lg border border-(--border-primary)">
                        <input
                          type="text"
                          placeholder="Course Name"
                          value={course.name}
                          onChange={(e) => onManageCourse("update", "elective", idx, "name", e.target.value)}
                          className="flex-1 min-w-50 px-3 py-2 rounded border border-(--border-primary) text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-(--text-secondary)">Credits:</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={course.credits}
                            onChange={(e) => onManageCourse("update", "elective", idx, "credits", Number(e.target.value))}
                            className="w-16 px-2 py-2 rounded border border-(--border-primary) text-sm text-center"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer bg-(--bg-card) px-3 py-2 rounded border border-(--border-primary)">
                          <input
                            type="checkbox"
                            checked={course.earlyCollegeCredit}
                            onChange={(e) => onManageCourse("update", "elective", idx, "earlyCollegeCredit", e.target.checked)}
                            className="rounded text-(--brand)"
                          />
                          <span className="text-xs font-medium whitespace-nowrap">College Credit?</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => onManageCourse("remove", "elective", idx)}
                          className="p-2 text-(--text-secondary) hover:text-(--danger) hover:bg-(--danger-soft) rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-(--bg-card) rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
          <div className="bg-(--bg-soft) px-6 py-4 border-b border-(--border-primary) flex items-center gap-2">
            <Briefcase size={20} className="text-(--text-primary)" />
            <h2 className="font-semibold text-xl">Professional Learning Fulfillment</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-(--text-secondary) mb-5">
              All pathways require 2 Career Exploration Activities, 2 Team Challenges, and 60 Work Experience Hours. How does this specific pathway fulfill them?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  editingPathway.requirements.professionalLearning.fulfillmentMethod === "embedded"
                    ? "border-(--brand) bg-(--brand-soft)"
                    : "border-(--border-primary) hover:border-(--brand)"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="radio"
                    name="profMethod"
                    checked={editingPathway.requirements.professionalLearning.fulfillmentMethod === "embedded"}
                    onChange={() => onProfLearningMethodChange("embedded")}
                    className="w-4 h-4 text-(--brand)"
                  />
                  <span className="font-bold text-(--text-primary)">Embedded in Coursework</span>
                </div>
                <p className="text-xs text-(--text-secondary) pl-7">
                  These hours are embedded within the required career-focused coursework automatically.
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  editingPathway.requirements.professionalLearning.fulfillmentMethod === "internship"
                    ? "border-(--brand) bg-(--brand-soft)"
                    : "border-(--border-primary) hover:border-(--brand)"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="radio"
                    name="profMethod"
                    checked={editingPathway.requirements.professionalLearning.fulfillmentMethod === "internship"}
                    onChange={() => onProfLearningMethodChange("internship")}
                    className="w-4 h-4 text-(--brand)"
                  />
                  <span className="font-bold text-(--text-primary)">Blended Career Internship</span>
                </div>
                <p className="text-xs text-(--text-secondary) pl-7">
                  Requires student to take the Blended Career Internship course to fulfill hours.
                </p>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
