import { fileSystemPathwaysRepository } from "@/lib/pathwaysStore";

export async function GET() {
  try {
    const academicSuccess = await fileSystemPathwaysRepository.getAcademicSuccess();
    return Response.json(academicSuccess);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load academic requirements.";
    return Response.json({ error: message }, { status: 500 });
  }
}
