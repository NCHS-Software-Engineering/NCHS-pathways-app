import { AlertCircle } from "lucide-react";

interface DeletePathwayModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeletePathwayModal({ onCancel, onConfirm }: DeletePathwayModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
      onClick={onCancel}
    >
      <div className="bg-(--bg-card) rounded-xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-(--text-primary) mb-2 flex items-center gap-2">
          <AlertCircle className="text-(--danger)" /> Delete Pathway?
        </h3>
        <p className="text-(--text-secondary) text-sm mb-6">Are you sure you want to delete this pathway? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-(--text-secondary) hover:bg-(--bg-soft) rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-(--danger) hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
