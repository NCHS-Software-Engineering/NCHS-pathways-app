"use client";
import React, { useEffect, useState } from "react";
import AcademicEditorView from "./components/AcademicEditorView";
import AdminHeader from "./components/AdminHeader";
import DeletePathwayModal from "./components/DeletePathwayModal";
import PathwayEditorView from "./components/PathwayEditorView";
import PathwaysListView from "./components/PathwaysListView";
import { emptyPathway, initialAcademicData } from "./mockData";
import { AcademicRequirement, AdminView, Course, Pathway, AcademicSuccessData } from "./types";

async function parseApiResponse(response: Response) {
  if (!response.ok) {
    let message = "Request failed.";
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // Keep fallback message.
    }
    throw new Error(message);
  }

  return response.json();
}

export default function AdminPage() {
  const [pathwaysDb, setPathwaysDb] = useState<Pathway[]>([]);
  const [academicDb, setAcademicDb] = useState<AcademicSuccessData>(initialAcademicData);

  const [view, setView] = useState<AdminView>("list");
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pathwayToDelete, setPathwayToDelete] = useState<string | null>(null);

  const [editingPathway, setEditingPathway] = useState<Pathway>(emptyPathway);
  const [isNewPathway, setIsNewPathway] = useState(false);

  const showSaveSuccess = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  useEffect(() => {
    let mounted = true;

    const loadAdminData = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const [pathways, academic] = await Promise.all([
          fetch("/api/admin/pathways").then(parseApiResponse),
          fetch("/api/admin/academic-success").then(parseApiResponse)
        ]);

        if (!mounted) return;
        setPathwaysDb(pathways);
        setAcademicDb(academic);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : "Failed to load admin data.";
        setLoadError(message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadAdminData();

    return () => {
      mounted = false;
    };
  }, []);

  // --- List View Actions ---
  const handleCreateNew = () => {
    setEditingPathway({ ...emptyPathway, id: `pathway-${Date.now()}` }); // Temp ID
    setIsNewPathway(true);
    setView("edit-pathway");
  };

  const handleEditPathway = (pathway: Pathway) => {
    setEditingPathway(JSON.parse(JSON.stringify(pathway))); // Deep clone
    setIsNewPathway(false);
    setView("edit-pathway");
  };

  const triggerDelete = (id: string) => {
    setPathwayToDelete(id);
  };

  const confirmDelete = async () => {
    if (pathwayToDelete !== null) {
      try {
        await fetch(`/api/admin/pathways/${pathwayToDelete}`, {
          method: "DELETE"
        }).then(parseApiResponse);

        setPathwaysDb(prev => prev.filter(p => p.id !== pathwayToDelete));
        showSaveSuccess("Pathway deleted from JSON data.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete pathway.";
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(""), 3000);
      } finally {
        setPathwayToDelete(null);
      }
    }
  };

  // --- Pathway Editor Actions ---
  const savePathwayToDb = async () => {
    if (!editingPathway.title.trim()) {
      setErrorMessage("Pathway needs a title.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      await fetch("/api/admin/pathways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPathway)
      }).then(parseApiResponse);

      setPathwaysDb((prev) => {
        if (isNewPathway) {
          return [...prev, editingPathway].sort((a, b) => a.title.localeCompare(b.title));
        }

        return prev
          .map((p) => (p.id === editingPathway.id ? editingPathway : p))
          .sort((a, b) => a.title.localeCompare(b.title));
      });

      showSaveSuccess("Pathway saved to JSON data successfully.");
      setView("list");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save pathway.";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handlePathwayBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isChecked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    setEditingPathway((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? isChecked : value
      } as Pathway;

      if (isNewPathway && name === "title") {
        newData.id = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }

      if (name === "tcd") {
        newData.requirements = {
          ...prev.requirements,
          pathwayType: isChecked ? "TCD" : "Regular",
          courseCredits: {
            ...prev.requirements.courseCredits,
            electiveCreditsRequired: isChecked ? 0 : prev.requirements.courseCredits.electiveCreditsRequired,
            electiveCourseOptions: isChecked ? [] : prev.requirements.courseCredits.electiveCourseOptions
          }
        };
      }

      return newData;
    });
  };

  const handleProfLearningMethodChange = (method: "embedded" | "internship") => {
    setEditingPathway((prev) => ({
      ...prev,
      requirements: { ...prev.requirements, professionalLearning: { fulfillmentMethod: method } }
    }));
  };

  const manageCourse = (
    action: "add" | "remove" | "update",
    type: "required" | "elective",
    index?: number,
    field?: keyof Course,
    value?: string | number | boolean
  ) => {
    setEditingPathway((prev) => {
      const key = type === "required" ? "requiredCourses" : "electiveCourseOptions";
      const newArray = [...prev.requirements.courseCredits[key]];

      if (action === 'add') newArray.push({ name: "", credits: 0.5, earlyCollegeCredit: false });
      if (action === 'remove' && index !== undefined) newArray.splice(index, 1);
      if (action === 'update' && index !== undefined && field) newArray[index] = { ...newArray[index], [field]: value };

      return {
        ...prev,
        requirements: { ...prev.requirements, courseCredits: { ...prev.requirements.courseCredits, [key]: newArray } }
      };
    });
  };

  const manageCoCurricular = (action: "add" | "remove" | "update", index?: number, value?: string) => {
    setEditingPathway((prev) => {
      const newExamples = [...prev.requirements.coCurricular.examples];
      if (action === 'add') newExamples.push("");
      if (action === 'remove' && index !== undefined) newExamples.splice(index, 1);
      if (action === 'update' && index !== undefined && value !== undefined) newExamples[index] = value;

      return {
        ...prev,
        requirements: { ...prev.requirements, coCurricular: { ...prev.requirements.coCurricular, examples: newExamples } }
      };
    });
  };

  const saveAcademicToDb = async () => {
    try {
      await fetch("/api/admin/academic-success", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(academicDb)
      }).then(parseApiResponse);

      showSaveSuccess("Academic requirements saved to JSON data.");
      setView("list");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save academic requirements.";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const textToArray = (txt: string) => txt.split("\n").filter((s) => s.trim().length > 0);

  const handleAcademicChange = (subject: "reading" | "math", field: keyof AcademicRequirement, value: string) => {
    setAcademicDb((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], [field]: textToArray(value) }
    }));
  };

  const handleTotalCreditsChange = (value: number) => {
    setEditingPathway((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        courseCredits: { ...prev.requirements.courseCredits, totalCreditsRequired: value }
      }
    }));
  };

  const handleElectiveCreditsChange = (value: number) => {
    setEditingPathway((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        courseCredits: { ...prev.requirements.courseCredits, electiveCreditsRequired: value }
      }
    }));
  };

  const handleCoCurricularRequiredChange = (required: boolean) => {
    setEditingPathway((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        coCurricular: { ...prev.requirements.coCurricular, required }
      }
    }));
  };


  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) font-sans pb-24">
      <AdminHeader saveMessage={saveMessage} />

      <main className="max-w-368 mx-auto px-8 py-10 text-[1.03rem]">
        {isLoading && (
          <div className="bg-(--bg-card) rounded-xl border border-(--border-primary) p-6 text-(--text-secondary)">
            Loading admin data...
          </div>
        )}

        {!isLoading && loadError && (
          <div className="bg-(--danger-soft) border border-(--danger) text-(--danger) rounded-xl p-6">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && view === "list" && (
          <PathwaysListView
            pathwaysDb={pathwaysDb}
            academicDb={academicDb}
            onCreateNew={handleCreateNew}
            onEditPathway={handleEditPathway}
            onDeletePathway={triggerDelete}
            onManageAcademic={() => setView("edit-academic")}
          />
        )}

        {!isLoading && !loadError && view === "edit-pathway" && (
          <PathwayEditorView
            editingPathway={editingPathway}
            isNewPathway={isNewPathway}
            errorMessage={errorMessage}
            onBack={() => setView("list")}
            onSave={savePathwayToDb}
            onPathwayBasicChange={handlePathwayBasicChange}
            onProfLearningMethodChange={handleProfLearningMethodChange}
            onManageCourse={manageCourse}
            onManageCoCurricular={manageCoCurricular}
            onTotalCreditsChange={handleTotalCreditsChange}
            onElectiveCreditsChange={handleElectiveCreditsChange}
            onCoCurricularRequiredChange={handleCoCurricularRequiredChange}
          />
        )}

        {!isLoading && !loadError && view === "edit-academic" && (
          <AcademicEditorView
            academicDb={academicDb}
            onBack={() => setView("list")}
            onSave={saveAcademicToDb}
            onAcademicChange={handleAcademicChange}
          />
        )}

        {pathwayToDelete !== null && <DeletePathwayModal onCancel={() => setPathwayToDelete(null)} onConfirm={confirmDelete} />}

      </main>
    </div>
  );
}