import { z } from "zod";

export const createVaultSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Vault Name is required" })
      .trim()
      .min(2, "Vault name must be at least 2 characters long")
      .max(30, "Vault name must be at most 30 characters long"),

    description: z
      .string()
      .trim()
      .max(200, "Vault description must be at most 200 characters long")
      .optional(),

    icon: z.string().trim().optional(),

    color: z
      .string()
      .trim()
      .regex(
        /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
        "Color must be a valid hex code",
      )
      .optional(),

    isPublic: z.boolean().optional().default(false),
  }),
});

export const updateVaultSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Vault Name is required" })
      .trim()
      .min(2, "Vault name must be at least 2 characters long")
      .max(30, "Vault name must be at most 30 characters long")
      .optional(),

    description: z
      .string()
      .trim()
      .max(200, "Vault description must be at most 200 characters long")
      .optional(),

    icon: z.string().trim().optional(),

    color: z
      .string()
      .trim()
      .regex(
        /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
        "Color must be a valid hex code",
      )
      .optional(),

    isPublic: z.boolean().optional(),
  }),

  params: z.object({
    slog: z.string({ error: "Vault slug is required" }),
  }),
});

// export inferred type
export type CreateVaultInput = z.infer<typeof createVaultSchema>["body"];
export type UpdateVaultInput = z.infer<typeof updateVaultSchema>["body"];
