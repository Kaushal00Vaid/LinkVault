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

export const createLinkSchema = z.object({
  body: z.object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(2, "Title must be at least 2 characters long")
      .max(100, "Title must be at most 100 characters long"),

    url: z
      .string({ error: "URL is required" })
      .trim()
      .url("Must be a valid URL"),

    alias: z
      .string()
      .trim()
      .min(2, "Alias must be at least 2 characters long")
      .max(60, "Alias must be at most 60 characters long")
      .optional(),

    description: z
      .string()
      .trim()
      .max(300, "Description must be at most 300 characters long")
      .optional(),

    tags: z
      .array(linkTagEnum)
      .max(5, "You can select up to 5 tags")
      .optional()
      .default([]),

    isFavorite: z.boolean().optional().default(false),
  }),

  params: z.object({
    slug: z.string({ error: "Vault slug is required" }),
  }),
});

export const updateLinkSchema = z.object({
  body: z.object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(2, "Title must be at least 2 characters long")
      .max(100, "Title must be at most 100 characters long")
      .optional(),

    url: z
      .string({ error: "URL is required" })
      .trim()
      .url("Must be a valid URL")
      .optional(),

    alias: z
      .string()
      .trim()
      .min(2, "Alias must be at least 2 characters long")
      .max(60, "Alias must be at most 60 characters long")
      .optional(),

    description: z
      .string()
      .trim()
      .max(300, "Description must be at most 300 characters long")
      .optional(),

    tags: z.array(linkTagEnum).max(5, "You can select up to 5 tags").optional(),
  }),

  params: z.object({
    slug: z.string({ error: "Vault slug is required" }),
    linkId: z.string({ error: "Link ID is required" }),
  }),
});

export const getVaultLinksSchema = z.object({
  params: z.object({
    slug: z.string({ error: "Vault slug is required" }),
  }),

  query: z.object({
    tag: linkTagEnum.optional(),
    favorite: z
      .string()
      .transform((val) => val === "true")
      .optional(),

    sort: z.enum(["newest", "oldest"]).optional().default("newest"),
  }),
});

// export inferred types
export type CreateLinkInput = z.infer<typeof createLinkSchema>["body"];
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>["body"];
export type GetVaultLinksQuery = z.infer<typeof getVaultLinksSchema>["query"];
