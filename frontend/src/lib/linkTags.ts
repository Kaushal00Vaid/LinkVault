import type { LinkTag } from "@/types";

export const LINK_TAGS: LinkTag[] = [
  "Docs",
  "UI/UX",
  "Tutorial",
  "Deployment",
  "Tool",
  "Reference",
  "Other",
];

export function parseTags(input: string): LinkTag[] {
  const parts = input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const out: LinkTag[] = [];
  for (const p of parts) {
    const match = LINK_TAGS.find((t) => t.toLowerCase() === p.toLowerCase());
    if (match && !out.includes(match)) out.push(match);
  }
  return out;
}
