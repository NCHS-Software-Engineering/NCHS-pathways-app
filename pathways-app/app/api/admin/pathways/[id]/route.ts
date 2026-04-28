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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const { id } = await context.params;
    if (!id) {
      return Response.json({ error: "Pathway id is required." }, { status: 400 });
    }

    await fileSystemPathwaysRepository.deletePathwayById(id);
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete pathway.";
    return Response.json({ error: message }, { status: 500 });
  }
}
