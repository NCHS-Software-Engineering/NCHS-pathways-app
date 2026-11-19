"use client";

import React, { useEffect, useMemo, useState } from "react";
import AcademicEditorView from "./components/AcademicEditorView";
import AdminHeader from "./components/AdminHeader";
import DeletePathwayModal from "./components/DeletePathwayModal";
import PathwayEditorView from "./components/PathwayEditorView";
import PathwaysListView from "./components/PathwaysListView";
import { AcademicRequirement, AdminView, Course, Pathway, AcademicSuccessData, RequiredCourseOptionGroup } from "./types";

const emptyPathway: Pathway = {
  id: "",
  title: "",
  category: "STEM",
  tcd: false,
  requirements: {
    pathwayType: "Regular",
    courseCredits: {
      totalCreditsRequired: 0,
      requiredCourses: [],
      requiredCourseOptionGroups: [],
      electiveCreditsRequired: 0,
      electiveCourseOptions: []
    },
    professionalLearning: { fulfillmentMethod: "embedded" },
    coCurricular: { required: false, examples: [] }
  }
};

const emptyAcademicData: AcademicSuccessData = {
  title: "",
  description: "",
  reading: {
    courseOptions: [],
    examOptions: [],
    testScoreOptions: []
  },
  math: {
    courseOptions: [],
    examOptions: [],
    testScoreOptions: []
  }
};

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

export default function AdminPageClient() {
  const [pathwaysDb, setPathwaysDb] = useState<Pathway[]>([]);
  const [academicDb, setAcademicDb] = useState<AcademicSuccessData>(emptyAcademicData);

  const [view, setView] = useState<AdminView>("list");
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pathwayToDelete, setPathwayToDelete] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
    const clonedPathway = JSON.parse(JSON.stringify(pathway)) as Pathway;
    setEditingPathway(ensureRequiredCourseOptionGroups(clonedPathway));
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
      const pathwayToSave = applyAutoCredits(ensureRequiredCourseOptionGroups(editingPathway));

      await fetch("/api/admin/pathways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pathwayToSave)
      }).then(parseApiResponse);

      setEditingPathway(pathwayToSave);

      setPathwaysDb((prev) => {
        if (isNewPathway) {
          return [...prev, pathwayToSave].sort((a, b) => a.title.localeCompare(b.title));
        }

        return prev
          .map((p) => (p.id === pathwayToSave.id ? pathwayToSave : p))
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

      return ensureRequiredCourseOptionGroups({
        ...prev,
        requirements: { ...prev.requirements, courseCredits: { ...prev.requirements.courseCredits, [key]: newArray } }
      });
    });
  };

  const manageRequiredCourseOptionGroup = (
    action: "add-group" | "remove-group" | "add-option" | "remove-option" | "update-option" | "set-required-selections",
    groupIndex?: number,
    optionIndex?: number,
    field?: keyof Course,
    value?: string | number | boolean
  ) => {
    setEditingPathway((prev) => {
      const currentGroups = prev.requirements.courseCredits.requiredCourseOptionGroups ?? [];
      const newGroups = currentGroups.map((group) => ({
        ...group,
        requiredSelections: Math.max(1, Math.floor(group.requiredSelections ?? 1)),
        options: [...(group.options ?? [])],
      }));

      if (action === "add-group") {
        newGroups.push({ requiredSelections: 1, options: [{ name: "", credits: 0.5, earlyCollegeCredit: false }] });
      }

      if (action === "remove-group" && groupIndex !== undefined) {
        newGroups.splice(groupIndex, 1);
      }

      if (action === "add-option" && groupIndex !== undefined) {
        const targetGroup = newGroups[groupIndex];
        if (targetGroup) {
          targetGroup.options.push({ name: "", credits: 0.5, earlyCollegeCredit: false });
        }
      }

      if (action === "remove-option" && groupIndex !== undefined && optionIndex !== undefined) {
        const targetGroup = newGroups[groupIndex];
        if (targetGroup) {
          targetGroup.options.splice(optionIndex, 1);
          if (targetGroup.options.length === 0) {
            newGroups.splice(groupIndex, 1);
          }
        }
      }

      if (
        action === "update-option" &&
        groupIndex !== undefined &&
        optionIndex !== undefined &&
        field
      ) {
        const targetGroup = newGroups[groupIndex];
        if (targetGroup && targetGroup.options[optionIndex]) {
          targetGroup.options[optionIndex] = {
            ...targetGroup.options[optionIndex],
            [field]: value,
          };
        }
      }

      if (action === "set-required-selections" && groupIndex !== undefined && typeof value === "number") {
        const targetGroup = newGroups[groupIndex];
        if (targetGroup) {
          const maxAllowed = Math.max(1, targetGroup.options.length);
          targetGroup.requiredSelections = Math.min(maxAllowed, Math.max(1, Math.floor(value)));
        }
      }

      for (const group of newGroups) {
        const maxAllowed = Math.max(1, group.options.length);
        group.requiredSelections = Math.min(maxAllowed, Math.max(1, Math.floor(group.requiredSelections ?? 1)));
      }

      return ensureRequiredCourseOptionGroups({
        ...prev,
        requirements: {
          ...prev.requirements,
          courseCredits: {
            ...prev.requirements.courseCredits,
            requiredCourseOptionGroups: newGroups,
          },
        },
      });
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

  const handlePathwayImageUpload = async (file: File) => {
    const pathwayId = editingPathway.id.trim();
    if (!pathwayId) {
      setErrorMessage("Set a pathway ID before uploading an image.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("pathwayId", pathwayId);

      const result = await fetch("/api/admin/pathway-image", {
        method: "POST",
        body: formData
      }).then(parseApiResponse);

      setEditingPathway((prev) => ({
        ...prev,
        imageFile: result.imageFile,
        imagePath: result.imagePath
      }));
      showSaveSuccess("Pathway image uploaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload pathway image.";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const imagePreviewCandidates = useMemo(() => {
    const pathwayId = editingPathway.id.trim();
    if (!pathwayId) {
      return [];
    }

    const params = new URLSearchParams({ pathwayId });
    if (typeof editingPathway.imageFile === "string" && editingPathway.imageFile.trim().length > 0) {
      params.set("imageFile", editingPathway.imageFile.trim());
    }

    return [`/api/admin/pathway-image?${params.toString()}`];
  }, [editingPathway.id, editingPathway.imageFile, editingPathway.imagePath]);

  const computedTotalCredits = useMemo(
    () => calculateTotalCreditsRequired(editingPathway),
    [editingPathway]
  );


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
            computedTotalCredits={computedTotalCredits}
            errorMessage={errorMessage}
            isUploadingImage={isUploadingImage}
            imagePreviewCandidates={imagePreviewCandidates}
            onBack={() => setView("list")}
            onSave={savePathwayToDb}
            onPathwayBasicChange={handlePathwayBasicChange}
            onPathwayImageUpload={handlePathwayImageUpload}
            onManageCourse={manageCourse}
            onManageRequiredCourseOptionGroup={manageRequiredCourseOptionGroup}
            onManageCoCurricular={manageCoCurricular}
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

function calculateTotalCreditsRequired(pathway: Pathway): number {
  const requiredCredits = pathway.requirements.courseCredits.requiredCourses.reduce(
    (sum, course) => sum + (typeof course.credits === "number" ? course.credits : 0),
    0
  );
  const requiredGroupCredits = (pathway.requirements.courseCredits.requiredCourseOptionGroups ?? []).reduce(
    (sum, group) => {
      const optionCredits = (group.options ?? [])
        .map((option) => (typeof option.credits === "number" ? option.credits : 0))
        .sort((a, b) => b - a);
      const requiredSelections = Math.max(
        1,
        Math.min(group.requiredSelections ?? 1, optionCredits.length || 1)
      );
      const selectedCredits = optionCredits.slice(0, requiredSelections).reduce((creditSum, credit) => creditSum + credit, 0);
      return sum + selectedCredits;
    },
    0
  );
  const electiveCredits = Number(pathway.requirements.courseCredits.electiveCreditsRequired ?? 0);
  return requiredCredits + requiredGroupCredits + electiveCredits;
}

function applyAutoCredits(pathway: Pathway): Pathway {
  return {
    ...pathway,
    requirements: {
      ...pathway.requirements,
      courseCredits: {
        ...pathway.requirements.courseCredits,
        totalCreditsRequired: calculateTotalCreditsRequired(pathway),
      },
    },
  };
}

function ensureRequiredCourseOptionGroups(pathway: Pathway): Pathway {
  const groups = (Array.isArray(pathway.requirements.courseCredits.requiredCourseOptionGroups)
    ? pathway.requirements.courseCredits.requiredCourseOptionGroups
    : [])
    .map((group: RequiredCourseOptionGroup) => {
      const options = Array.isArray(group.options) ? group.options : [];
      const requiredSelections = Math.max(
        1,
        Math.min(group.requiredSelections ?? 1, options.length || 1)
      );

      return {
        ...group,
        requiredSelections,
        options,
      };
    });

  return {
    ...pathway,
    requirements: {
      ...pathway.requirements,
      courseCredits: {
        ...pathway.requirements.courseCredits,
        requiredCourseOptionGroups: groups,
      },
    },
  };
}