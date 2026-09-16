import { and, eq, getTableColumns, like, ne } from "drizzle-orm";

import { db } from "@/server/db";
import { medication } from "@server/modules/inventory/infrastructure/db/medication.schema";

import { user } from "@/server/db/schema";
import type { SearchMedicationsDto } from "../dtos/medication.dto";

// ==================== CASO DE USO: BUSCAR MEDICAMENTOS (RF13) ====================

export async function searchMedications(
  filters: SearchMedicationsDto,
  userId?: string
) {
  try {
    const conditions = [];

    if (filters.activeSubstance) {
      conditions.push(
        like(medication.activeSubstance, `%${filters.activeSubstance}%`)
      );
    }
    if (filters.dosage) {
      conditions.push(like(medication.dosage, `%${filters.dosage}%`));
    }
    if (filters.postalCode) {
      conditions.push(eq(medication.postalCode, filters.postalCode));
    }
    if (filters.status) {
      conditions.push(eq(medication.status, filters.status));
    } else {
      conditions.push(eq(medication.status, "disponible"));
    }
    if (filters.onlyVisible !== false) {
      conditions.push(eq(medication.isVisible, true));
    }

    // Filter out own medications if requested and user is authenticated
    if (filters.excludeOwnMedications && userId) {
      conditions.push(ne(medication.donorId, userId));
    }

    // --- CAMBIO PRINCIPAL AQUÍ ---
    const results = await db
      .select({
        // 1. Traemos todas las columnas del medicamento automáticamente
        ...getTableColumns(medication),

        // 2. Construimos el objeto del donador (SOLO datos públicos)
        donor: {
          name: user.name,
          image: user.image, // O photoUrl, como lo tengas en tu tabla user
          // id: user.id // Opcional, si lo necesitas
        },
      })
      .from(medication)
      .innerJoin(user, eq(medication.donorId, user.id))
      .where(and(...conditions))
      .orderBy(medication.createdAt);

    return {
      success: true,
      medications: results,
      total: results.length,
    };
  } catch (error) {
    console.error("Error searching medications:", error);
    return {
      success: false,
      medications: [],
      total: 0,
      error: "Error al buscar medicamentos",
    };
  }
}

// ==================== CASO DE USO: LISTAR MEDICAMENTOS DISPONIBLES ====================

export async function listAvailableMedications() {
  try {
    const medications = await db
      .select()
      .from(medication)
      .where(
        and(eq(medication.status, "disponible"), eq(medication.isVisible, true))
      )
      .orderBy(medication.createdAt);

    return {
      success: true,
      medications,
      total: medications.length,
    };
  } catch (error) {
    console.error("Error listing medications:", error);
    return {
      success: false,
      medications: [],
      total: 0,
      error: "Error al listar medicamentos",
    };
  }
}

// ==================== CASO DE USO: BUSCAR POR SUSTANCIA Y GRAMAJE ====================

export async function searchBySubstanceAndDosage(
  activeSubstance: string,
  dosage?: string
) {
  try {
    const conditions = [
      like(medication.activeSubstance, `%${activeSubstance}%`),
      eq(medication.status, "disponible"),
      eq(medication.isVisible, true),
    ];

    if (dosage) {
      conditions.push(like(medication.dosage, `%${dosage}%`));
    }

    const medications = await db
      .select()
      .from(medication)
      .where(and(...conditions))
      .orderBy(medication.createdAt);

    return {
      success: true,
      medications,
      total: medications.length,
    };
  } catch (error) {
    console.error("Error searching by substance and dosage:", error);
    return {
      success: false,
      medications: [],
      total: 0,
      error: "Error al buscar medicamentos",
    };
  }
}
