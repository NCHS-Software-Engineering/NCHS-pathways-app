import { authOptions, isAllowedAdminEmail } from "@/lib/auth";
import { mkdir, readFile, stat, writeFile } from "fs/promises";
import { getServerSession } from "next-auth";
import path from "path";

const APP_IMAGE_DIR = path.join(process.cwd(), "app", "endorsements", "images");
const PUBLIC_IMAGE_DIR = path.join(process.cwd(), "public", "endorsements", "images");
const PREVIEW_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

async function authorizeRequest() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!isAllowedAdminEmail(email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

function sanitizePathwayId(id: string): string {
  return id
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function determineExtension(file: File): string {
  const fileName = typeof file.name === "string" ? file.name : "";
  const rawExt = path.extname(fileName).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(rawExt)) {
    return rawExt === ".jpeg" ? ".jpg" : rawExt;
  }

  return MIME_EXTENSION_MAP[file.type] ?? ".jpg";
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

async function resolvePreviewFilePath(pathwayId: string, imageFile?: string): Promise<string | null> {
  const sanitizedPathwayId = sanitizePathwayId(pathwayId);
  const candidateNames: string[] = [];

  if (imageFile && imageFile.trim().length > 0) {
    candidateNames.push(path.basename(imageFile.trim()));
  }

  for (const extension of PREVIEW_EXTENSIONS) {
    candidateNames.push(`${sanitizedPathwayId}${extension}`);
  }

  const uniqueNames = Array.from(new Set(candidateNames));

  for (const fileName of uniqueNames) {
    const appPath = path.join(APP_IMAGE_DIR, fileName);
    if (await fileExists(appPath)) {
      return appPath;
    }

    const publicPath = path.join(PUBLIC_IMAGE_DIR, fileName);
    if (await fileExists(publicPath)) {
      return publicPath;
    }
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const pathwayId = sanitizePathwayId(searchParams.get("pathwayId") ?? "");
    const imageFile = searchParams.get("imageFile") ?? "";

    if (!pathwayId) {
      return Response.json({ error: "Pathway id is required." }, { status: 400 });
    }

    const resolvedPath = await resolvePreviewFilePath(pathwayId, imageFile);
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
    const message = error instanceof Error ? error.message : "Failed to load pathway image preview.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const formData = await request.formData();
    const image = formData.get("image");
    const pathwayIdRaw = formData.get("pathwayId");

    if (!(image instanceof File)) {
      return Response.json({ error: "Image file is required." }, { status: 400 });
    }

    const pathwayId = typeof pathwayIdRaw === "string" ? sanitizePathwayId(pathwayIdRaw) : "";
    if (!pathwayId) {
      return Response.json({ error: "Valid pathway id is required." }, { status: 400 });
    }

    if (!image.type.startsWith("image/")) {
      return Response.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }

    const extension = determineExtension(image);
    const imageFile = `${pathwayId}${extension}`;
    const appOutputPath = path.join(APP_IMAGE_DIR, imageFile);
    const publicOutputPath = path.join(PUBLIC_IMAGE_DIR, imageFile);

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await mkdir(APP_IMAGE_DIR, { recursive: true });
    await mkdir(PUBLIC_IMAGE_DIR, { recursive: true });
    await writeFile(appOutputPath, buffer);
    await writeFile(publicOutputPath, buffer);

    return Response.json({
      success: true,
      imageFile,
      imagePath: `/endorsements/images/${imageFile}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload pathway image.";
    return Response.json({ error: message }, { status: 500 });
  }
}
