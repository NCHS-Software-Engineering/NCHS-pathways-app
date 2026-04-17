import { authOptions, isAllowedDistrictEmail } from "@/lib/auth";
import { fileSystemPathwaysRepository } from "@/lib/pathwaysStore";
import { getServerSession } from "next-auth";

async function authorizeRequest() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!isAllowedDistrictEmail(email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET() {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const academicSuccess = await fileSystemPathwaysRepository.getAcademicSuccess();
    return Response.json(academicSuccess);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load academic requirements.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const academicSuccess = await request.json();

    if (!academicSuccess?.title || !academicSuccess?.reading || !academicSuccess?.math) {
      return Response.json({ error: "Invalid academic requirements payload." }, { status: 400 });
    }

    await fileSystemPathwaysRepository.updateAcademicSuccess(academicSuccess);
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save academic requirements.";
    return Response.json({ error: message }, { status: 500 });
  }
}
