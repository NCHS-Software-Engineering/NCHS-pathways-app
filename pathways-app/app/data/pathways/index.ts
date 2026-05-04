import type { Pathway } from "@/app/dashboard/types";

// Dynamically load all pathway JSON files using webpack's require.context so
// that new pathways added to this directory are picked up automatically without
// requiring manual code changes.
// academic-success.json is excluded because it is loaded separately by the
// dashboard. template.json is excluded because it is an admin scaffolding file
// used to scaffold new pathway entries.
/* eslint-disable @typescript-eslint/no-explicit-any */
const ctx = (require as any).context(
  "./",
  false,
  /^\.\/(?!(academic-success|template)).*\.json$/
) as { keys(): string[]; (id: string): Pathway };

export const pathways: Record<string, Pathway> = Object.fromEntries(
  ctx.keys().map((key: string) => [
    key.replace(/^\.\//, "").replace(/\.json$/, ""),
    ctx(key),
  ])
);