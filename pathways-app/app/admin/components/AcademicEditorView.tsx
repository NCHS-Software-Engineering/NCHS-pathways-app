import { ArrowLeft, BookOpen, Calculator, Save } from "lucide-react";
import { AcademicRequirement, AcademicSuccessData } from "../types";

interface AcademicEditorViewProps {
  academicDb: AcademicSuccessData;
  onBack: () => void;
  onSave: () => void;
  onAcademicChange: (subject: "reading" | "math", field: keyof AcademicRequirement, value: string) => void;
}

const arrayToText = (arr: string[]) => arr.join("\n");

export default function AcademicEditorView({ academicDb, onBack, onSave, onAcademicChange }: AcademicEditorViewProps) {
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
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-2 bg-(--brand) hover:opacity-90 text-white px-7 py-3 rounded-lg font-medium transition-all shadow-sm"
        >
          <Save size={18} /> Save Global Requirements
        </button>
      </div>

      <div className="bg-(--bg-card) rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="bg-(--bg-soft) px-6 py-5 border-b border-(--border-primary)">
          <h2 className="text-2xl font-bold text-(--text-primary)">Academic Success Lists</h2>
          <p className="text-sm text-(--text-secondary) mt-1">
            Manage the options available for students to fulfill their global Reading and Math requirements. <strong>Enter one option per line.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-(--border-primary)">
          <div className="p-6 space-y-6">
            <h3 className="font-bold text-lg text-(--competency-reading-text) flex items-center gap-2">
              <BookOpen className="text-(--competency-reading-accent)" /> Reading Competency
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--text-secondary)">Approved Coursework Options</label>
              <textarea
                rows={6}
                value={arrayToText(academicDb.reading.courseOptions)}
                onChange={(e) => onAcademicChange("reading", "courseOptions", e.target.value)}
                className="w-full p-3 rounded-lg border border-(--competency-reading-border) bg-(--competency-reading-soft) focus:bg-(--bg-card) focus:outline-none focus:ring-2 focus:ring-(--competency-reading-accent)/50 text-sm whitespace-pre"
                placeholder="English Composition 1&#10;AP Literature..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--text-secondary)">AP Exam Options</label>
              <textarea
                rows={3}
                value={arrayToText(academicDb.reading.examOptions)}
                onChange={(e) => onAcademicChange("reading", "examOptions", e.target.value)}
                className="w-full p-3 rounded-lg border border-(--competency-reading-border) bg-(--competency-reading-soft) focus:bg-(--bg-card) focus:outline-none focus:ring-2 focus:ring-(--competency-reading-accent)/50 text-sm whitespace-pre"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--text-secondary)">Standardized Test Options</label>
              <textarea
                rows={3}
                value={arrayToText(academicDb.reading.testScoreOptions)}
                onChange={(e) => onAcademicChange("reading", "testScoreOptions", e.target.value)}
                className="w-full p-3 rounded-lg border border-(--competency-reading-border) bg-(--competency-reading-soft) focus:bg-(--bg-card) focus:outline-none focus:ring-2 focus:ring-(--competency-reading-accent)/50 text-sm whitespace-pre"
              />
            </div>
          </div>

          <div className="p-6 space-y-6 bg-(--competency-math-soft)/30">
            <h3 className="font-bold text-lg text-(--competency-math-text) flex items-center gap-2">
              <Calculator className="text-(--competency-math-accent)" /> Math Competency
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--text-secondary)">Approved Coursework Options</label>
              <textarea
                rows={6}
                value={arrayToText(academicDb.math.courseOptions)}
                onChange={(e) => onAcademicChange("math", "courseOptions", e.target.value)}
                className="w-full p-3 rounded-lg border border-(--competency-math-border) bg-(--competency-math-soft) focus:bg-(--bg-card) focus:outline-none focus:ring-2 focus:ring-(--competency-math-accent)/50 text-sm whitespace-pre"
                placeholder="AP Calculus AB&#10;Algebra 2..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--text-secondary)">AP Exam Options</label>
              <textarea
                rows={3}
                value={arrayToText(academicDb.math.examOptions)}
                onChange={(e) => onAcademicChange("math", "examOptions", e.target.value)}
                className="w-full p-3 rounded-lg border border-(--competency-math-border) bg-(--competency-math-soft) focus:bg-(--bg-card) focus:outline-none focus:ring-2 focus:ring-(--competency-math-accent)/50 text-sm whitespace-pre"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--text-secondary)">Standardized Test Options</label>
              <textarea
                rows={3}
                value={arrayToText(academicDb.math.testScoreOptions)}
                onChange={(e) => onAcademicChange("math", "testScoreOptions", e.target.value)}
                className="w-full p-3 rounded-lg border border-(--competency-math-border) bg-(--competency-math-soft) focus:bg-(--bg-card) focus:outline-none focus:ring-2 focus:ring-(--competency-math-accent)/50 text-sm whitespace-pre"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
