import { z } from "zod";

export const donorProfileSchema = z.object({
  // ===== Información personal =====
  fullName: z.string().min(2, "El nombre es muy corto"),
  phone: z.string().min(10, "Número inválido").optional().or(z.literal("")),

  // ===== Tipo de donante =====
  donorType: z.enum(["individual", "pharmacy", "hospital", "clinic", "ngo"], {
    message: "Selecciona un tipo de donante",
  }),

  // ===== Información adicional =====
  organization: z.string().optional(),
  idDocument: z
    .string({ error: "Requerido (RFC o Identificación)" })
    .optional(),

  // ===== Información de dirección =====
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z
    .string()
    .length(5, "CP debe ser de 5 dígitos")
    .optional()
    .or(z.literal("")),
  country: z.string().default("México"), // NUEVO

  // ===== Validación médica =====
  medicalLicense: z.string().optional(),

  // ===== Verificación =====
  verificationDocument: z.string().optional(), // URL del documento

  // ===== Configuración del perfil =====
  profilePicture: z.string().optional(), // NUEVO - URL de la imagen
  bio: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export type DonorProfilePayload = z.infer<typeof donorProfileSchema>;
