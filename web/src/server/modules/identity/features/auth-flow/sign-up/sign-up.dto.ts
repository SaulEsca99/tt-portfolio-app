import { z } from "zod";

import { calculateAge } from "../../../domain/identity.validation";

export const signUpDtoSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .optional(),
  birthDate: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === "string" ? new Date(val) : val))
    .refine((date) => !isNaN(date.getTime()), "Invalid date format")
    .refine(
      (date) => calculateAge(date) >= 18,
      "User must be at least 18 years old"
    )
    .optional(),
});

export type SignUpDto = z.infer<typeof signUpDtoSchema>;

export type SignUpInput = z.input<typeof signUpDtoSchema>;
