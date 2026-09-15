import { z } from 'zod';

// Base User Schema
export const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
});

// Portfolio Project Schema
export const ProjectSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(10, "Provide a descriptive summary"),
  techStack: z.array(z.string()).min(1, "Specify at least one technology"),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
});

export type User = z.infer<typeof UserSchema>;
export type Project = z.infer<typeof ProjectSchema>;