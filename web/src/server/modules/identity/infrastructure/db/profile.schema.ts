import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { timestampColumns } from "@server/db/columns.helpers";

import { user } from "./auth.schema";

// ==================== TABLA: PERFILES DE DONANTES ====================

export const donorProfile = pgTable("donor_profile", {
    id: serial("id").primaryKey(),

    // ===== Relación con usuario de autenticación =====
    userId: text("user_id")
        .notNull()
        .unique()
        .references(() => user.id, { onDelete: "cascade" }),

    // ===== Información personal =====
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),

    // ===== Tipo de donante =====
    donorType: varchar("donor_type", { length: 100 }), // individual, pharmacy, hospital, clinic, ngo

    // ===== Información adicional =====
    organization: varchar("organization", { length: 255 }), // Si aplica (nombre de farmacia, hospital, etc.)
    idDocument: varchar("id_document", { length: 100 }), // Número de identificación/pasaporte

    // ===== Información de dirección =====
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 100 }).default("México"),

    // ===== Validación médica (para medicamentos controlados) =====
    medicalLicense: varchar("medical_license", { length: 100 }), // Matrícula médica
    medicalLicenseVerified: boolean("medical_license_verified").default(false),

    // ===== Verificación =====
    verificationStatus: varchar("verification_status", { length: 50 })
        .notNull()
        .default("pending"), // pending, verified, rejected
    verificationDocument: varchar("verification_document", { length: 500 }), // URL del documento subido
    verifiedAt: timestamp("verified_at"),

    // ===== Estadísticas =====
    totalDonations: integer("total_donations").default(0),
    totalMedicationsDonated: integer("total_medications_donated").default(0),
    recentDonations: integer("recent_donations").default(0), // Últimos 30 días

    // ===== Configuración del perfil =====
    profilePicture: varchar("profile_picture", { length: 500 }),
    bio: text("bio"),
    isActive: boolean("is_active").default(true),

    // ===== Timestamps =====
    ...timestampColumns,
});

export type SelectDonorProfile = typeof donorProfile.$inferSelect;
export type InsertDonorProfile = typeof donorProfile.$inferInsert;

// ==================== TABLA: PERFILES DE BENEFICIARIOS/RECEPTORES ====================

export const recipientProfile = pgTable("recipient_profile", {
    id: serial("id").primaryKey(),

    // ===== Relación con usuario de autenticación =====
    userId: text("user_id")
        .notNull()
        .unique()
        .references(() => user.id, { onDelete: "cascade" }),

    // ===== Información personal =====
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    dateOfBirth: timestamp("date_of_birth"),

    // ===== Tipo de beneficiario =====
    recipientType: varchar("recipient_type", { length: 100 }), // individual, family, community_organization

    // ===== Información adicional =====
    idDocument: varchar("id_document", { length: 100 }), // Número de identificación/pasaporte
    socialSecurityNumber: varchar("social_security_number", { length: 100 }),

    // ===== Información de dirección =====
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 100 }).default("México"),

    // ===== Información socioeconómica =====
    employmentStatus: varchar("employment_status", { length: 100 }), // employed, unemployed, retired, student
    monthlyIncome: varchar("monthly_income", { length: 100 }), // rango de ingresos
    hasHealthInsurance: boolean("has_health_insurance").default(false),
    insuranceProvider: varchar("insurance_provider", { length: 255 }),
    socioeconomicScore: integer("socioeconomic_score"), // Score del examen socioeconómico

    // ===== Información médica =====
    chronicConditions: text("chronic_conditions"), // Lista de condiciones crónicas
    allergies: text("allergies"),
    currentMedications: text("current_medications"),
    disabilities: text("disabilities"), // Discapacidades

    // ===== Verificación =====
    verificationStatus: varchar("verification_status", { length: 50 })
        .notNull()
        .default("pending"), // pending, verified, rejected
    verificationDocument: varchar("verification_document", { length: 500 }), // URL del documento subido
    economicProof: varchar("economic_proof", { length: 500 }), // URL a comprobante de capacidad económica
    verifiedAt: timestamp("verified_at"),

    // ===== Estadísticas =====
    totalRequests: integer("total_requests").default(0),
    totalMedicationsReceived: integer("total_medications_received").default(0),
    totalReceived: integer("total_received").default(0), // Alias para compatibilidad

    // ===== Configuración del perfil =====
    profilePicture: varchar("profile_picture", { length: 500 }),
    bio: text("bio"),
    isActive: boolean("is_active").default(true),

    // ===== Timestamps =====
    ...timestampColumns,
});

export type SelectRecipientProfile = typeof recipientProfile.$inferSelect;
export type InsertRecipientProfile = typeof recipientProfile.$inferInsert;
