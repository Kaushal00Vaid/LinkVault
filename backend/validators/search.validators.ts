import { z } from "zod";

const linkTagEnum = z.enum([
  "Docs",
  "UI/UX",
  "Tutorial",
  "Deployment",
  "Tool",
  "Reference",
  "Other",
]);

export const searchSchema = z.object({
  query: z.object({
    q: z
      .string()
      .trim()
      .min(1, "Search query cannot be empty")
      .max(100, "Search query too long")
      .optional(),

    tag: linkTagEnum.optional(),

    vaultSlug: z.string().trim().optional(),

    favorite: z
      .string()
      .transform((val) => val === "true")
      .optional(),

    sort: z
      .enum(["newest", "oldest", "relevant"])
      .optional()
      .default("relevant"),

    page: z.coerce.number().min(1).optional().default(1),

    limit: z.coerce.number().min(1).optional().default(10),
  }),
});

export type SearchQuery = z.infer<typeof searchSchema>["query"];
