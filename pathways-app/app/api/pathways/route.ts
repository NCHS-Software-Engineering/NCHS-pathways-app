import { fileSystemPathwaysRepository } from "@/lib/pathwaysStore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim().toLowerCase();

  try {
    const pathways = await fileSystemPathwaysRepository.getAllPathwaysForAdmin();

    if (name) {
      const match = pathways.find((pathway) => {
        const pathwayId = pathway.id?.trim().toLowerCase();
        const pathwayTitle = pathway.title?.trim().toLowerCase();
        return pathwayId === name || pathwayTitle === name;
      });

      if (!match) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json(match);
    }

    const result = Object.fromEntries(pathways.map((pathway) => [pathway.id, pathway]));
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load pathways" }, { status: 500 });
  }
}