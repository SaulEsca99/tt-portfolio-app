import { createId } from "@paralleldrive/cuid2";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { medication } from "@/server/modules/inventory/infrastructure/db/medication.schema";
import { user } from "@/server/modules/identity/infrastructure/db/auth.schema";

export const medicationRequest = pgTable(
    "medication_request",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),

        // Relaciones
        medicationId: integer("medication_id")
            .notNull()
            .references(() => medication.id, { onDelete: "cascade" }),
        requesterId: text("requester_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),

        // Información del solicitante
        requesterName: text("requester_name").notNull(),
        requesterPhone: text("requester_phone").notNull(),

        // Razón de la solicitud
        medicalSituation: text("medical_situation").notNull(),
        urgencyLevel: text("urgency_level", {
            enum: ["low", "medium", "high", "critical"],
        })
            .notNull()
            .default("medium"),

        // Score socioeconómico (del perfil del receptor)
        socioeconomicScore: integer("socioeconomic_score"),

        // Estado de la solicitud
        status: text("status", {
            enum: ["pending", "accepted", "rejected", "cancelled", "expired"],
        })
            .notNull()
            .default("pending"),

        // Timestamps
        requestedAt: timestamp("requested_at").notNull().defaultNow(),
        respondedAt: timestamp("responded_at"),
        expiresAt: timestamp("expires_at"), // 24 horas después de requestedAt

        // Metadata
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
        medicationIdIdx: index("medication_request_medication_id_idx").on(
            table.medicationId
        ),
        requesterIdIdx: index("medication_request_requester_id_idx").on(
            table.requesterId
        ),
        statusIdx: index("medication_request_status_idx").on(table.status),
    })
);

export type MedicationRequest = typeof medicationRequest.$inferSelect;
export type NewMedicationRequest = typeof medicationRequest.$inferInsert;
