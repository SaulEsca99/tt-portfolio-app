import { z } from "zod";

export const createRecipientProfileSchema = z
  .object({
    userId: z.string().min(1, "El ID de usuario es requerido"),
    fullName: z
      .string()
      .min(2, "El nombre completo debe tener al menos 2 caracteres")
      .max(255),
    phone: z
      .string()
      .regex(/^\+?[0-9\s-]{10,20}$/, "Formato de teléfono inválido")
      .optional(),
    dateOfBirth: z.coerce
      .date()
      .max(new Date(), "La fecha de nacimiento no puede ser futura")
      .optional(),
    recipientType: z
      .enum(["individual", "family", "community_organization"])
      .optional(),
    idDocument: z.string().max(100).optional(),
    socialSecurityNumber: z.string().max(100).optional(),
    address: z.string().optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postalCode: z
      .string()
      .regex(/^[0-9]{5}$/, "El código postal debe tener 5 dígitos")
      .optional(),
    country: z.string().max(100).default("México"),
    employmentStatus: z
      .enum(["employed", "unemployed", "retired", "student", "self-employed"])
      .optional(),
    monthlyIncome: z
      .enum(["none", "low", "medium-low", "medium", "medium-high", "high"])
      .optional(),
    hasHealthInsurance: z.boolean().default(false),
    insuranceProvider: z.string().max(255).optional(),
    chronicConditions: z.string().max(1000).optional(),
    allergies: z.string().max(500).optional(),
    currentMedications: z.string().max(1000).optional(),
    disabilities: z.string().max(500).optional(),
    bio: z
      .string()
      .max(1000, "La biografía no puede exceder 1000 caracteres")
      .optional(),

    economicProof: z.url("URL del documento inválida").optional(),
    verificationDocument: z.url("URL del documento inválida").optional(),

    profilePicture: z.url("URL de imagen inválida").optional(),
  })
  .refine(
    (data) => {
      if (data.hasHealthInsurance && !data.insuranceProvider) {
        return false;
      }
      return true;
    },
    {
      message:
        "Debe proporcionar el proveedor de seguro si tiene seguro médico",
      path: ["insuranceProvider"],
    }
  );

export const updateRecipientProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre completo debe tener al menos 2 caracteres")
    .max(255)
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{10,20}$/, "Formato de teléfono inválido")
    .optional(),
  dateOfBirth: z.coerce
    .date()
    .max(new Date(), "La fecha de nacimiento no puede ser futura")
    .optional(),
  recipientType: z
    .enum(["individual", "family", "community_organization"])
    .optional(),
  idDocument: z.string().max(100).optional(),
  socialSecurityNumber: z.string().max(100).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "El código postal debe tener 5 dígitos")
    .optional(),
  country: z.string().max(100).optional(),
  employmentStatus: z
    .enum(["employed", "unemployed", "retired", "student", "self-employed"])
    .optional(),
  monthlyIncome: z
    .enum(["none", "low", "medium-low", "medium", "medium-high", "high"])
    .optional(),
  hasHealthInsurance: z.boolean().optional(),
  insuranceProvider: z.string().max(255).optional(),
  chronicConditions: z.string().max(1000).optional(),
  allergies: z.string().max(500).optional(),
  currentMedications: z.string().max(1000).optional(),
  disabilities: z.string().max(500).optional(),
  bio: z
    .string()
    .max(1000, "La biografía no puede exceder 1000 caracteres")
    .optional(),

  economicProof: z.string().url("URL del documento inválida").optional(),
  verificationDocument: z.string().url("URL del documento inválida").optional(),
  profilePicture: z.url("URL de imagen inválida").optional(),
});

export const recipientProfileResponseSchema = z.object({
  id: z.number(),
  userId: z.string(),
  fullName: z.string(),
  phone: z.string().nullable().optional(),
  dateOfBirth: z.date().nullable().optional(),
  recipientType: z.string().nullable().optional(),
  idDocument: z.string().nullable().optional(),
  socialSecurityNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  employmentStatus: z.string().nullable().optional(),
  monthlyIncome: z.string().nullable().optional(),
  hasHealthInsurance: z.boolean(),
  insuranceProvider: z.string().nullable().optional(),
  socioeconomicScore: z.number().nullable().optional(),
  chronicConditions: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),
  currentMedications: z.string().nullable().optional(),
  disabilities: z.string().nullable().optional(),
  verificationStatus: z.enum(["pending", "verified", "rejected"]),
  verificationDocument: z.string().nullable().optional(),
  economicProof: z.string().nullable().optional(),
  verifiedAt: z.date().nullable().optional(),
  totalRequests: z.number(),
  totalMedicationsReceived: z.number(),
  totalReceived: z.number(),
  profilePicture: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const uploadDocumentSchema = z.object({
  profileId: z.number().positive("El ID del perfil debe ser positivo"),
  documentType: z.enum(["verification", "economic_proof"]),
  documentUrl: z.url("URL del documento inválida"),
});

export const verifyRecipientProfileSchema = z.object({
  recipientProfileId: z.number().positive("El ID del perfil debe ser positivo"),
  verified: z.boolean(),
  socioeconomicScore: z
    .number()
    .min(0)
    .max(100, "El score debe estar entre 0 y 100")
    .optional(),
  verificationDocument: z.url("URL del documento inválida").optional(),
});

export type CreateRecipientProfileDTO = z.infer<
  typeof createRecipientProfileSchema
>;
export type UpdateRecipientProfileDTO = z.infer<
  typeof updateRecipientProfileSchema
>;
export type RecipientProfileResponseDTO = z.infer<
  typeof recipientProfileResponseSchema
>;
export type UploadDocumentDTO = z.infer<typeof uploadDocumentSchema>;
export type VerifyRecipientProfileDTO = z.infer<
  typeof verifyRecipientProfileSchema
>;
