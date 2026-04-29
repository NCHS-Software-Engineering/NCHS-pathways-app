import { authOptions, isAllowedAdminEmail } from "@/lib/auth";
import { fileSystemPathwaysRepository } from "@/lib/pathwaysStore";
import { getServerSession } from "next-auth";

async function authorizeRequest() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!isAllowedAdminEmail(email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET() {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const pathways = await fileSystemPathwaysRepository.getAllPathwaysForAdmin();
    return Response.json(pathways);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load pathways.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const pathway = await request.json();

    if (!pathway?.id || !pathway?.title) {
      return Response.json({ error: "Pathway id and title are required." }, { status: 400 });
    }

    await fileSystemPathwaysRepository.upsertPathwayFromAdmin(pathway);
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save pathway.";
    return Response.json({ error: message }, { status: 500 });
  }
}
