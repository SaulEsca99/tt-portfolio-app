import { z } from "zod";

export const createMedicationRequestSchema = z.object({
    medicationId: z.number().int().positive("ID de medicamento inválido"),
    requesterName: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre es demasiado largo"),
    requesterPhone: z
        .string()
        .regex(
            /^\+?[1-9]\d{1,14}$/,
            "Formato de teléfono inválido. Usa formato internacional (ej. +52 123 456 7890)"
        ),
    medicalSituation: z
        .string()
        .min(20, "Por favor describe tu situación con más detalle (mínimo 20 caracteres)")
        .max(500, "La descripción es demasiado larga (máximo 500 caracteres)"),
    urgencyLevel: z.enum(["low", "medium", "high", "critical"]),
});

export type CreateMedicationRequestDTO = z.infer<
    typeof createMedicationRequestSchema
>;

export const updateRequestStatusSchema = z.object({
    requestId: z.string().min(1, "ID de solicitud requerido"),
    status: z.enum(["accepted", "rejected", "cancelled"]),
});

export type UpdateRequestStatusDTO = z.infer<typeof updateRequestStatusSchema>;

// Schema para búsqueda/filtrado de solicitudes
export const searchRequestsSchema = z.object({
    medicationId: z.string().optional(),
    requesterId: z.string().optional(),
    status: z
        .enum(["pending", "accepted", "rejected", "cancelled", "expired"])
        .optional(),
    urgencyLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export type SearchRequestsDTO = z.infer<typeof searchRequestsSchema>;
