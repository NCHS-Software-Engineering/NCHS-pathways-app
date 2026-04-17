import { fileSystemPathwaysRepository } from "@/lib/pathwaysStore";

export async function GET() {
  try {
    const pathways = await fileSystemPathwaysRepository.getAllPathwaysForAdmin();
    return Response.json(pathways);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load pathways.";
    return Response.json({ error: message }, { status: 500 });
  }
}
