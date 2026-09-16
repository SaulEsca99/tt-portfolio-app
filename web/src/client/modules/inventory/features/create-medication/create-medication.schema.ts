import { z } from "zod";

export const createMedicationSchema = z.object({
  activeSubstance: z.string().min(2, "Mínimo 2 caracteres"),

  dosage: z.string().min(1, "Requerido"),

  quantity: z.coerce.number().positive("Debe ser mayor a 0"),

  brand: z.string().optional(),
  presentation: z.string().optional(),

  expiryDate: z.date().refine(
    (date) => {
      const today = new Date();
      const minDate = new Date();
      minDate.setDate(today.getDate() + 30);
      return date > minDate;
    },
    { message: "La caducidad debe ser mayor a 30 días" }
  ),

  lotNumber: z.string().optional(),
  laboratory: z.string().optional(),

  location: z.string().min(3, "Ubicación requerida"),
  postalCode: z
    .string()
    .length(5, "Debe ser de 5 dígitos")
    .optional()
    .or(z.literal("")),

  description: z.string().optional(),
  preferredSchedule: z
    .string()
    .max(500, "Muy largo")
    .optional()
    .or(z.literal("")),

  notes: z.string().optional(),

  photoUrl: z.url("URL inválida").or(z.literal("")),

  isControlled: z.boolean().default(false),
});

export type CreateMedicationPayload = z.infer<typeof createMedicationSchema>;
