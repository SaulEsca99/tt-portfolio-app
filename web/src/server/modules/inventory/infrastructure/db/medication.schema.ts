import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { timestampColumns } from "@server/db/columns.helpers";

import { user } from "@server/modules/identity/infrastructure/db/auth.schema";

// ==================== TABLA: MEDICAMENTOS (INVENTARIO) ====================

export const medication = pgTable("medication", {
    id: serial("id").primaryKey(),

    // ===== Relación con donador =====
    donorId: text("donor_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    // ===== Información del medicamento (RF7) =====
    activeSubstance: varchar("active_substance", { length: 255 }).notNull(), // Sustancia activa
    dosage: varchar("dosage", { length: 100 }).notNull(), // Gramaje (ej: "500mg")
    quantity: integer("quantity").notNull().default(1), // Cantidad disponible
    brand: varchar("brand", { length: 255 }), // Marca (opcional)
    presentation: varchar("presentation", { length: 100 }), // Presentación (ej: "caja con 10 tabletas")

    // ===== Información de caducidad y lote (RF8) =====
    expiryDate: timestamp("expiry_date").notNull(), // Fecha de caducidad
    lotNumber: varchar("lot_number", { length: 100 }), // Número de lote
    laboratory: varchar("laboratory", { length: 255 }), // Laboratorio fabricante

    // ===== Foto del medicamento =====
    photoUrl: varchar("photo_url", { length: 500 }), // URL de la foto

    // ===== Ubicación y logística =====
    location: varchar("location", { length: 255 }).notNull(), // Ubicación de entrega
    postalCode: varchar("postal_code", { length: 20 }), // Código postal para búsqueda por distancia
    preferredSchedule: text("preferred_schedule"), // Horario preferido de entrega

    // ===== Estados de publicación (RF9) =====
    // disponible, reservado, entregado, cancelado
    status: varchar("status", { length: 50 }).notNull().default("disponible"),

    // ===== Información adicional =====
    description: text("description"), // Descripción adicional
    notes: text("notes"), // Notas del donador

    // ===== Control de visibilidad (RF10) =====
    isVisible: boolean("is_visible").default(true).notNull(), // Oculto si caducidad < 30 días
    hiddenReason: varchar("hidden_reason", { length: 255 }), // Razón de ocultamiento

    // ===== Medicamento controlado =====
    isControlled: boolean("is_controlled").default(false).notNull(), // Requiere matrícula médica

    // ===== Timestamps =====
    ...timestampColumns,
});

export type SelectMedication = typeof medication.$inferSelect;
export type InsertMedication = typeof medication.$inferInsert;
