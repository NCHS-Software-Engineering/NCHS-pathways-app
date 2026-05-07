import { Award, Edit, GraduationCap, Plus, Settings, Trash2 } from "lucide-react";
import { AcademicSuccessData, Pathway } from "../types";

interface PathwaysListViewProps {
  pathwaysDb: Pathway[];
  academicDb: AcademicSuccessData;
  onCreateNew: () => void;
  onEditPathway: (pathway: Pathway) => void;
  onDeletePathway: (id: string) => void;
  onManageAcademic: () => void;
}

export default function PathwaysListView({
  pathwaysDb,
  academicDb,
  onCreateNew,
  onEditPathway,
  onDeletePathway,
  onManageAcademic
}: PathwaysListViewProps) {
  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-serif font-bold flex items-center gap-3">
            <GraduationCap size={28} className="text-(--brand)" />
            Pathways Collection
          </h2>
          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-2 bg-(--brand) hover:opacity-90 text-white px-5 py-3 rounded-lg font-semibold transition-all shadow-sm text-base"
          >
            <Plus size={18} /> Add New Pathway
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pathwaysDb.map((pathway) => (
            <div key={pathway.id} className="bg-(--bg-card) rounded-xl border border-(--border-primary) shadow-sm p-6 flex flex-col">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider text-(--chip-text) bg-(--chip-bg) px-2.5 py-1 rounded">
                    {pathway.category}
                  </span>
                  {pathway.tcd && (
                    <span className="text-sm font-bold uppercase tracking-wider text-(--tcd-chip-text) bg-(--tcd-chip-bg) px-2.5 py-1 rounded">TCD</span>
                  )}
                </div>
                <h3 className="font-bold text-xl leading-tight">{pathway.title}</h3>
                <p className="text-base text-(--text-secondary) mt-3">
                  {pathway.requirements.courseCredits.totalCreditsRequired} Total Credits Required
                </p>
              </div>
              <div className="flex gap-2 mt-7 pt-4 border-t border-(--border-primary)">
                <button
                  type="button"
                  onClick={() => onEditPathway(pathway)}
                  className="flex-1 flex items-center justify-center gap-2 bg-(--brand-soft) text-(--brand-text) py-2.5 rounded-lg text-base font-medium hover:bg-(--admin-soft-hover) transition-colors"
                >
                  <Edit size={18} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePathway(pathway.id)}
                  className="p-2.5 text-(--text-secondary) hover:text-(--danger) hover:bg-(--danger-soft) rounded-lg transition-colors border border-transparent hover:border-(--danger-border)"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-10 border-t border-(--border-primary)">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-serif font-bold flex items-center gap-3">
            <Award size={28} className="text-(--brand)" />
            Global Requirements
          </h2>
        </div>

        <div className="bg-(--bg-card) rounded-xl border border-(--border-primary) shadow-sm p-7 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xl">{academicDb.title}</h3>
            <p className="text-base text-(--text-secondary) mt-2">Manage global Math and Reading requirements that apply to all endorsements.</p>
          </div>
          <button
            type="button"
            onClick={onManageAcademic}
            className="flex items-center gap-2 border border-(--border-primary) hover:border-(--brand) hover:text-(--brand) px-5 py-3 rounded-lg font-medium transition-all shadow-sm text-base"
          >
            <Settings size={18} /> Manage Requirements
          </button>
        </div>
      </section>
    </div>
  );
}
