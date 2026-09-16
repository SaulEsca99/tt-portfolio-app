import { z } from "zod";

export const createDonorProfileSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es requerido"),
  fullName: z
    .string()
    .min(2, "El nombre completo debe tener al menos 2 caracteres")
    .max(255),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{10,20}$/, "Formato de teléfono inválido")
    .optional(),
  donorType: z
    .enum(["individual", "pharmacy", "hospital", "clinic", "ngo"])
    .optional(),
  organization: z.string().max(255).optional(),
  idDocument: z.string().max(100).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "El código postal debe tener 5 dígitos")
    .optional(),
  country: z.string().max(100).default("México"),
  medicalLicense: z.string().max(100).optional(),
  bio: z
    .string()
    .max(1000, "La biografía no puede exceder 1000 caracteres")
    .optional(),
  verificationDocument: z.string().optional(),
  profilePicture: z.url("URL de imagen inválida").optional(),
});

export const updateDonorProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre completo debe tener al menos 2 caracteres")
    .max(255)
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{10,20}$/, "Formato de teléfono inválido")
    .optional(),
  donorType: z
    .enum(["individual", "pharmacy", "hospital", "clinic", "ngo"])
    .optional(),
  organization: z.string().max(255).optional(),
  idDocument: z.string().max(100).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "El código postal debe tener 5 dígitos")
    .optional(),
  country: z.string().max(100).optional(),
  medicalLicense: z.string().max(100).optional(),
  bio: z
    .string()
    .max(1000, "La biografía no puede exceder 1000 caracteres")
    .optional(),

  verificationDocument: z.string().optional(),
  profilePicture: z.url("URL de imagen inválida").optional(),
});

export const donorProfileResponseSchema = z.object({
  id: z.number(),
  userId: z.string(),
  fullName: z.string(),
  phone: z.string().nullable().optional(),
  donorType: z.string().nullable().optional(),
  organization: z.string().nullable().optional(),
  idDocument: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  medicalLicense: z.string().nullable().optional(),
  medicalLicenseVerified: z.boolean(),
  verificationStatus: z.enum(["pending", "verified", "rejected"]),
  verificationDocument: z.string().nullable().optional(),
  verifiedAt: z.date().nullable().optional(),
  totalDonations: z.number(),
  totalMedicationsDonated: z.number(),
  recentDonations: z.number(),
  profilePicture: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const verifyDonorMedicalLicenseSchema = z.object({
  donorProfileId: z.number().positive("El ID del perfil debe ser positivo"),
  verified: z.boolean(),
  verificationDocument: z.url("URL del documento inválida").optional(),
});

export type CreateDonorProfileDTO = z.infer<typeof createDonorProfileSchema>;
export type UpdateDonorProfileDTO = z.infer<typeof updateDonorProfileSchema>;
export type DonorProfileResponseDTO = z.infer<
  typeof donorProfileResponseSchema
>;
export type VerifyDonorMedicalLicenseDTO = z.infer<
  typeof verifyDonorMedicalLicenseSchema
>;
