import { z } from "zod";

// ==================== SCHEMA DE VALIDACIÓN: CREAR MEDICAMENTO ====================

export const createMedicationSchema = z.object({
  // ===== Información del medicamento (RF7) =====
  activeSubstance: z
    .string()
    .min(2, "La sustancia activa debe tener al menos 2 caracteres")
    .max(255, "La sustancia activa es demasiado larga"),

  dosage: z
    .string()
    .min(1, "El gramaje es requerido")
    .max(100, "El gramaje es demasiado largo")
    .describe("Ej: 500mg, 10ml, 250mg/5ml"),

  quantity: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0")
    .default(1),

  brand: z.string().max(255, "La marca es demasiado larga").optional(),

  presentation: z
    .string()
    .max(100, "La presentación es demasiado larga")
    .optional()
    .describe("Ej: caja con 10 tabletas, frasco de 100ml"),

  // ===== Información de caducidad y lote (RF8) =====
  expiryDate: z.date().refine(
    (date) => {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      return date > thirtyDaysFromNow;
    },
    {
      message: "La fecha de caducidad debe ser mayor a 30 días desde hoy",
    }
  ),

  lotNumber: z
    .string()
    .max(100, "El número de lote es demasiado largo")
    .optional(),

  laboratory: z
    .string()
    .max(255, "El nombre del laboratorio es demasiado largo")
    .optional(),

  // ===== Foto del medicamento =====
  photoUrl: z
    .url("Debe ser una URL válida")
    .max(500, "La URL es demasiado larga")
    .optional(),

  // ===== Ubicación y logística =====
  location: z
    .string()
    .min(3, "La ubicación debe tener al menos 3 caracteres")
    .max(255, "La ubicación es demasiado larga"),

  postalCode: z
    .string()
    .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos")
    .optional(),

  preferredSchedule: z
    .string()
    .max(500, "El horario preferido es demasiado largo")
    .optional()
    .describe("Ej: Lunes a Viernes de 9:00 a 17:00"),

  // ===== Información adicional =====
  description: z
    .string()
    .max(1000, "La descripción es demasiado larga")
    .optional(),

  notes: z.string().max(500, "Las notas son demasiado largas").optional(),

  // ===== Medicamento controlado =====
  isControlled: z
    .boolean()
    .default(false)
    .describe("Requiere matrícula médica del donador"),
});

export type CreateMedicationDto = z.infer<typeof createMedicationSchema>;

// ==================== SCHEMA DE VALIDACIÓN: ACTUALIZAR MEDICAMENTO ====================

export const updateMedicationSchema = createMedicationSchema.partial().extend({
  // Permitir actualizar el estado
  status: z
    .enum(["disponible", "reservado", "entregado", "cancelado"])
    .optional(),

  // Permitir ocultar/mostrar manualmente
  isVisible: z.boolean().optional(),
  hiddenReason: z.string().max(255).optional(),
});

export type UpdateMedicationDto = z.infer<typeof updateMedicationSchema>;

// ==================== SCHEMA DE BÚSQUEDA ====================

export const searchMedicationsSchema = z.object({
  activeSubstance: z.string().optional(),
  dosage: z.string().optional(),
  postalCode: z.string().optional(),
  maxDistance: z
    .number()
    .positive()
    .optional()
    .describe("Distancia máxima en km"),
  status: z
    .enum(["disponible", "reservado", "entregado", "cancelado"])
    .optional(),
  onlyVisible: z.boolean().default(true),
  excludeOwnMedications: z.boolean().optional(),
});

export type SearchMedicationsDto = z.infer<typeof searchMedicationsSchema>;
