import { s3DownloadFile, s3FileExists, S3_IMAGES_PREFIX } from "@/lib/s3Storage";
import { readFile, stat } from "fs/promises";
import path from "path";

const USE_S3 = process.env.USE_S3 === "true";

const APP_IMAGE_DIR = path.join(process.cwd(), "app", "endorsements", "images");
const PUBLIC_IMAGE_DIR = path.join(process.cwd(), "public", "endorsements", "images");
const PREVIEW_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function sanitizePathwayId(id: string): string {
  return id
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getMimeTypeFromExtension(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  return "image/jpeg";
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveCandidateNames(pathwayId: string, imageFile?: string, imagePath?: string): string[] {
  const sanitizedPathwayId = sanitizePathwayId(pathwayId);
  const candidateNames: string[] = [];

  if (imageFile && imageFile.trim().length > 0) {
    candidateNames.push(path.basename(imageFile.trim()));
  }

  if (imagePath && imagePath.trim().length > 0) {
    candidateNames.push(path.basename(imagePath.trim()));
  }

  for (const extension of PREVIEW_EXTENSIONS) {
    candidateNames.push(`${sanitizedPathwayId}${extension}`);
  }

  return Array.from(new Set(candidateNames));
}

async function resolvePreviewFilePath(pathwayId: string, imageFile?: string, imagePath?: string): Promise<string | null> {
  const candidateNames = resolveCandidateNames(pathwayId, imageFile, imagePath);

  for (const fileName of candidateNames) {
    const appPath = path.join(APP_IMAGE_DIR, fileName);
    if (await fileExists(appPath)) return appPath;

    const publicPath = path.join(PUBLIC_IMAGE_DIR, fileName);
    if (await fileExists(publicPath)) return publicPath;
  }

  return null;
}

async function resolveS3ImageKey(pathwayId: string, imageFile?: string, imagePath?: string): Promise<string | null> {
  const candidateNames = resolveCandidateNames(pathwayId, imageFile, imagePath);

  for (const fileName of candidateNames) {
    const key = `${S3_IMAGES_PREFIX}${fileName}`;
    if (await s3FileExists(key)) return key;
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pathwayId = sanitizePathwayId(searchParams.get("pathwayId") ?? "");
    const imageFile = searchParams.get("imageFile") ?? "";
    const imagePath = searchParams.get("imagePath") ?? "";

    if (!pathwayId) {
      return Response.json({ error: "Pathway id is required." }, { status: 400 });
    }

    if (USE_S3) {
      const s3Key = await resolveS3ImageKey(pathwayId, imageFile, imagePath);
      if (!s3Key) {
        return Response.json({ error: "Pathway image not found." }, { status: 404 });
      }

      const bytes = await s3DownloadFile(s3Key);
      return new Response(new Uint8Array(bytes), {
        headers: {
          "Content-Type": getMimeTypeFromExtension(s3Key),
          "Cache-Control": "no-store",
        },
      });
    }

    const resolvedPath = await resolvePreviewFilePath(pathwayId, imageFile, imagePath);
    if (!resolvedPath) {
      return Response.json({ error: "Pathway image not found." }, { status: 404 });
    }

    const bytes = await readFile(resolvedPath);
    return new Response(bytes, {
      headers: {
        "Content-Type": getMimeTypeFromExtension(resolvedPath),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load pathway image.";
    return Response.json({ error: message }, { status: 500 });
  }
}