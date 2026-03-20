import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Name is required" })
      .trim()
      .min(2, "Name must be atleast 2 characters long")
      .max(50, "Name must be atmost 50 characters long"),

    email: z
      .string({ error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string({ error: "Password is required" })
      .trim()
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password must be at most 100 characters long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z.string({ error: "Password is required" }),
  }),
});

// inferred types -- for controllers
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
