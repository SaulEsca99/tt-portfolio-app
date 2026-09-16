import { z } from "zod";

export const recipientProfileSchema = z.object({
  // ===== Información personal =====
  fullName: z.string().min(2, "Requerido"),
  dateOfBirth: z.coerce
    .date({
      error: (issue) =>
        issue.input === undefined ? "Fecha requerida" : "Fecha inválida",
    })
    .optional(),
  phone: z.string().min(10, "Número inválido").optional(),

  // ===== Tipo de beneficiario (NUEVO) =====
  recipientType: z
    .enum(["individual", "family", "community_organization"])
    .default("individual"),

  // ===== Información adicional =====
  idDocument: z.string().min(1, "Requerido"),
  socialSecurityNumber: z.string().optional(),

  // ===== Dirección =====
  address: z.string().min(5, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  state: z.string().min(2, "Estado requerido"),
  postalCode: z.string().length(5, "CP de 5 dígitos"),
  country: z.string().default("México"),

  // ===== Información socioeconómica =====
  employmentStatus: z.enum(
    ["employed", "unemployed", "self-employed", "retired", "student"],
    { message: "Estatus requerido" }
  ),

  monthlyIncome: z.enum([
    "none",
    "low",
    "medium-low",
    "medium",
    "medium-high",
    "high",
  ]),

  hasHealthInsurance: z.boolean().default(false),
  insuranceProvider: z.string().optional(),

  // ===== Información médica =====
  chronicConditions: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  disabilities: z.string().optional(),

  // ===== Verificación =====
  economicProof: z.string().optional(), // URL del archivo
  verificationDocument: z.string().optional(), // URL del archivo
});

export type RecipientProfilePayload = z.infer<typeof recipientProfileSchema>;
