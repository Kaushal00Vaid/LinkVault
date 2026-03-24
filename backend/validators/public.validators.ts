import { z } from "zod";

export const browsePublicVaultsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    sort: z.enum(["newest", "oldest", "popular"]).optional().default("newest"),
  }),
});

export const searchPublicVaultsSchema = z.object({
  query: z.object({
    q: z
      .string({ error: "Search query is required" })
      .trim()
      .min(1, "Search query cannot be empty")
      .max(100, "Search query too long"),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type BrowsePublicVaultsQuery = z.infer<
  typeof browsePublicVaultsSchema
>["query"];
export type SearchPublicVaultsQuery = z.infer<
  typeof searchPublicVaultsSchema
>["query"];
