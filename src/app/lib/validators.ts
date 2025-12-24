import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(200)
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(200)
});

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1).max(60),
  description: z.string().trim().max(2000).optional().default(""),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium")
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  dueDate: z.union([z.string().datetime(), z.null()]).optional()
});

export const noteCreateSchema = z.object({
  content: z.string().trim().min(1).max(1000)
});
