import { promises as fs } from "fs";
import path from "path";
import { s3DeleteFile, s3DownloadFile, s3ListFiles, s3UploadFile, S3_PATHWAYS_PREFIX, S3_IMAGES_PREFIX } from "./s3Storage";

export interface AdminCourse {
  name: string;
  credits: number;
  earlyCollegeCredit: boolean;
}

export interface AdminPathway {
  id: string;
  title: string;
  category: string;
  tcd: boolean;
  requirements: {
    pathwayType: string;
    courseCredits: {
      totalCreditsRequired: number;
      requiredCourses: AdminCourse[];
      electiveCreditsRequired: number;
      electiveCourseOptions: AdminCourse[];
    };
    professionalLearning: {
      fulfillmentMethod?: "embedded" | "internship";
      careerExplorationActivities?: number;
      teamChallenges?: number;
      workExperienceHours?: number;
      notes?: string;
      [key: string]: unknown;
    };
    coCurricular: {
      required: boolean;
      examples: string[];
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AcademicRequirement {
  courseOptions: string[];
  examOptions: string[];
  testScoreOptions: string[];
}

export interface AcademicSuccessData {
  title: string;
  description: string;
  reading: AcademicRequirement;
  math: AcademicRequirement;
}

export interface PathwaysRepository {
  getAllPathwaysForAdmin: () => Promise<AdminPathway[]>;
  upsertPathwayFromAdmin: (pathway: AdminPathway) => Promise<void>;
  deletePathwayById: (id: string) => Promise<void>;
  getAcademicSuccess: () => Promise<AcademicSuccessData>;
  updateAcademicSuccess: (academicSuccess: AcademicSuccessData) => Promise<void>;
}

const PATHWAYS_DIR = path.join(process.cwd(), "app", "data", "pathways");
const ACADEMIC_SUCCESS_FILE = path.join(PATHWAYS_DIR, "academic-success.json");
const APP_ENDORSEMENT_IMAGES_DIR = path.join(process.cwd(), "app", "endorsements", "images");
const PUBLIC_ENDORSEMENT_IMAGES_DIR = path.join(process.cwd(), "public", "endorsements", "images");
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;

const EMBEDDED_NOTES = "these hours are embedded within the required career-focused coursework";
const INTERNSHIP_NOTES = "Requires student to take the Blended Career Internship course to fulfill hours";

interface PathwayProfessionalLearningRaw {
  notes?: unknown;
  [key: string]: unknown;
}

interface PathwayRequirementsRaw {
  pathwayType?: unknown;
  professionalLearning?: PathwayProfessionalLearningRaw;
  [key: string]: unknown;
}

interface PathwayRaw {
  id?: unknown;
  imageFile?: unknown;
  imagePath?: unknown;
  tcd?: unknown;
  requirements?: PathwayRequirementsRaw;
  [key: string]: unknown;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const pretty = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, pretty, "utf-8");
}

async function listPathwayFiles(): Promise<string[]> {
  const dirEntries = await fs.readdir(PATHWAYS_DIR, { withFileTypes: true });

  return dirEntries
    .filter((entry) => {
      if (!entry.isFile()) return false;
      if (!entry.name.endsWith(".json")) return false;
      return entry.name !== "academic-success.json" && entry.name !== "template.json";
    })
    .map((entry) => path.join(PATHWAYS_DIR, entry.name));
}

function inferFulfillmentMethod(pathway: PathwayRaw): "embedded" | "internship" {
  const notes = String(pathway.requirements?.professionalLearning?.notes ?? "").toLowerCase();
  return notes.includes("internship") ? "internship" : "embedded";
}

function normalizePathwayForAdmin(pathway: PathwayRaw): AdminPathway {
  const fulfillmentMethod = inferFulfillmentMethod(pathway);
  const requirements = pathway.requirements ?? {};
  const professionalLearning = requirements.professionalLearning ?? {};

  return {
    ...pathway,
    tcd: Boolean(pathway.tcd ?? requirements.pathwayType === "TCD"),
    requirements: {
      ...requirements,
      professionalLearning: {
        ...professionalLearning,
        fulfillmentMethod,
      },
    },
  } as AdminPathway;
}

function denormalizePathwayForStorage(pathway: AdminPathway): Record<string, unknown> {
  const professionalLearning = pathway.requirements.professionalLearning ?? {};
  const {
    fulfillmentMethod,
    careerExplorationActivities,
    teamChallenges,
    workExperienceHours,
    ...professionalLearningRest
  } = professionalLearning;

  return {
    ...pathway,
    requirements: {
      ...pathway.requirements,
      pathwayType: pathway.tcd ? "TCD" : "Regular",
      professionalLearning: {
        ...professionalLearningRest,
        careerExplorationActivities: Number(careerExplorationActivities ?? 2),
        teamChallenges: Number(teamChallenges ?? 2),
        workExperienceHours: Number(workExperienceHours ?? 60),
        notes: fulfillmentMethod === "internship" ? INTERNSHIP_NOTES : EMBEDDED_NOTES,
      },
    },
  };
}

async function resolvePathwayFilePathById(id: string): Promise<string | null> {
  const files = await listPathwayFiles();

  for (const filePath of files) {
    const filePathway = await readJsonFile<{ id?: string }>(filePath);
    if (filePathway.id === id) {
      return filePath;
    }
  }

  return null;
}

function makeNewPathwayFilePath(id: string): string {
  const safeId = id
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return path.join(PATHWAYS_DIR, `${safeId || `pathway-${Date.now()}`}.json`);
}

function safeUnlink(filePath: string): Promise<void> {
  return fs.unlink(filePath).catch(() => undefined);
}

async function deletePathwayImages(pathway: PathwayRaw): Promise<void> {
  const pathwayId = typeof pathway.id === "string" ? pathway.id.trim().toLowerCase() : "";
  const explicitImageFile =
    typeof pathway.imageFile === "string" && pathway.imageFile.trim().length > 0
      ? path.basename(pathway.imageFile.trim())
      : "";
  const imagePathFile =
    typeof pathway.imagePath === "string" && pathway.imagePath.trim().length > 0
      ? path.basename(pathway.imagePath.trim())
      : "";

  const candidateFiles = new Set<string>();
  if (explicitImageFile) candidateFiles.add(explicitImageFile);
  if (imagePathFile) candidateFiles.add(imagePathFile);
  if (pathwayId) {
    for (const extension of IMAGE_EXTENSIONS) {
      candidateFiles.add(`${pathwayId}${extension}`);
    }
  }

  await Promise.all(
    Array.from(candidateFiles).flatMap((fileName) => [
      safeUnlink(path.join(APP_ENDORSEMENT_IMAGES_DIR, fileName)),
      safeUnlink(path.join(PUBLIC_ENDORSEMENT_IMAGES_DIR, fileName)),
    ])
  );
}

const S3_ACADEMIC_SUCCESS_KEY = "pathways/academic-success.json";

function makeS3PathwayKey(fileName: string): string {
  return `${S3_PATHWAYS_PREFIX}${fileName}`;
}

function makeS3ImageKey(fileName: string): string {
  return `${S3_IMAGES_PREFIX}${fileName}`;
}

async function s3ReadJsonFile<T>(key: string): Promise<T> {
  const buffer = await s3DownloadFile(key);
  return JSON.parse(buffer.toString("utf-8")) as T;
}

async function s3WriteJsonFile(key: string, data: unknown): Promise<void> {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  await s3UploadFile(key, Buffer.from(content, "utf-8"), "application/json");
}

async function s3ListPathwayFiles(): Promise<string[]> {
  const keys = await s3ListFiles(S3_PATHWAYS_PREFIX);
  return keys.filter((key) => {
    const fileName = key.slice(S3_PATHWAYS_PREFIX.length);
    if (!fileName.endsWith(".json")) return false;
    return fileName !== "academic-success.json" && fileName !== "template.json";
  });
}

function makeNewS3PathwayKey(id: string): string {
  const safeId = id
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return makeS3PathwayKey(`${safeId || `pathway-${Date.now()}`}.json`);
}

async function resolveS3PathwayKeyById(id: string): Promise<string | null> {
  const keys = await s3ListPathwayFiles();

  for (const key of keys) {
    const pathway = await s3ReadJsonFile<{ id?: string }>(key);
    if (pathway.id === id) return key;
  }

  return null;
}

async function deleteS3PathwayImages(pathway: PathwayRaw): Promise<void> {
  const pathwayId = typeof pathway.id === "string" ? pathway.id.trim().toLowerCase() : "";
  const explicitImageFile =
    typeof pathway.imageFile === "string" && pathway.imageFile.trim().length > 0
      ? path.basename(pathway.imageFile.trim())
      : "";
  const imagePathFile =
    typeof pathway.imagePath === "string" && pathway.imagePath.trim().length > 0
      ? path.basename(pathway.imagePath.trim())
      : "";

  const candidateFiles = new Set<string>();
  if (explicitImageFile) candidateFiles.add(explicitImageFile);
  if (imagePathFile) candidateFiles.add(imagePathFile);
  if (pathwayId) {
    for (const extension of IMAGE_EXTENSIONS) {
      candidateFiles.add(`${pathwayId}${extension}`);
    }
  }

  await Promise.all(
    Array.from(candidateFiles).map((fileName) =>
      s3DeleteFile(makeS3ImageKey(fileName)).catch(() => undefined)
    )
  );
}

export const s3PathwaysRepository: PathwaysRepository = {
  async getAllPathwaysForAdmin() {
    const keys = await s3ListPathwayFiles();
    const pathways = await Promise.all(keys.map((key) => s3ReadJsonFile<PathwayRaw>(key)));
    return pathways.map(normalizePathwayForAdmin).sort((a, b) => a.title.localeCompare(b.title));
  },

  async upsertPathwayFromAdmin(pathway) {
    const existingKey = await resolveS3PathwayKeyById(pathway.id);
    const outputKey = existingKey ?? makeNewS3PathwayKey(pathway.id);
    const pathwayForStorage = denormalizePathwayForStorage(pathway);
    await s3WriteJsonFile(outputKey, pathwayForStorage);
  },

  async deletePathwayById(id) {
    const existingKey = await resolveS3PathwayKeyById(id);
    if (!existingKey) return;

    const existingPathway = await s3ReadJsonFile<PathwayRaw>(existingKey);
    await deleteS3PathwayImages(existingPathway);
    await s3DeleteFile(existingKey);
  },

  async getAcademicSuccess() {
    return s3ReadJsonFile<AcademicSuccessData>(S3_ACADEMIC_SUCCESS_KEY);
  },

  async updateAcademicSuccess(academicSuccess) {
    await s3WriteJsonFile(S3_ACADEMIC_SUCCESS_KEY, academicSuccess);
  },
};

export function getPathwaysRepository(): PathwaysRepository {
  if (process.env.USE_S3 === "true") return s3PathwaysRepository;
  return fileSystemPathwaysRepository;
}

export const fileSystemPathwaysRepository: PathwaysRepository = {
  async getAllPathwaysForAdmin() {
    const files = await listPathwayFiles();
    const pathways = await Promise.all(files.map((filePath) => readJsonFile<PathwayRaw>(filePath)));

    return pathways.map(normalizePathwayForAdmin).sort((a, b) => a.title.localeCompare(b.title));
  },

  async upsertPathwayFromAdmin(pathway) {
    const existingPath = await resolvePathwayFilePathById(pathway.id);
    const outputPath = existingPath ?? makeNewPathwayFilePath(pathway.id);
    const pathwayForStorage = denormalizePathwayForStorage(pathway);

    await writeJsonFile(outputPath, pathwayForStorage);
  },

  async deletePathwayById(id) {
    const existingPath = await resolvePathwayFilePathById(id);
    if (!existingPath) return;

    const existingPathway = await readJsonFile<PathwayRaw>(existingPath);
    await deletePathwayImages(existingPathway);

    await fs.unlink(existingPath);
  },

  async getAcademicSuccess() {
    return readJsonFile<AcademicSuccessData>(ACADEMIC_SUCCESS_FILE);
  },

  async updateAcademicSuccess(academicSuccess) {
    await writeJsonFile(ACADEMIC_SUCCESS_FILE, academicSuccess);
  },
};
