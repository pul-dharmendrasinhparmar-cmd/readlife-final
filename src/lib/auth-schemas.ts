import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
});

export const registerSchema = credentialsSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Name is too long.")
    .optional()
    .or(z.literal("")),
});
