import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { medication } from "@server/modules/inventory/infrastructure/db/medication.schema";

import type { CreateMedicationDto } from "../dtos/medication.dto";

// ==================== CASO DE USO: CREAR MEDICAMENTO ====================

export interface CreateMedicationResult {
  success: boolean;
  medicationId?: number;
  error?: string;
}

export async function createMedication(
  donorId: string,
  input: CreateMedicationDto
): Promise<CreateMedicationResult> {
  try {
    // Validar que el medicamento no esté caducado o próximo a caducar (RF8)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (input.expiryDate <= thirtyDaysFromNow) {
      return {
        success: false,
        error: "El medicamento debe tener una caducidad mayor a 30 días",
      };
    }

    let processedPhotoUrl = input.photoUrl;

    if (input.photoUrl) {
      try {
        const urlObj = new URL(input.photoUrl);

        const pathSegments = urlObj.pathname.split("/");

        if (pathSegments.length >= 3) {
          processedPhotoUrl = "/" + pathSegments.slice(2).join("/");
        } else {
          processedPhotoUrl = urlObj.pathname;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // console.log(e);

        console.warn(
          "No se pudo parsear la URL de la foto, guardando valor original"
        );
      }
    }

    // Determinar si el medicamento debe estar visible (RF10)
    const isVisible = input.expiryDate > thirtyDaysFromNow;

    // Crear el medicamento
    const [newMedication] = await db
      .insert(medication)
      .values({
        donorId,
        activeSubstance: input.activeSubstance,
        dosage: input.dosage,
        quantity: input.quantity ?? 1,
        brand: input.brand,
        presentation: input.presentation,
        expiryDate: input.expiryDate,
        lotNumber: input.lotNumber,
        laboratory: input.laboratory,
        photoUrl: processedPhotoUrl,
        location: input.location,
        postalCode: input.postalCode,
        preferredSchedule: input.preferredSchedule,
        description: input.description,
        notes: input.notes,
        isControlled: input.isControlled ?? false,
        status: "disponible",
        isVisible,
        hiddenReason: isVisible ? null : "Caducidad menor a 30 días",
      })
      .returning();

    return {
      success: true,
      medicationId: newMedication.id,
    };
  } catch (error) {
    console.error("Error creating medication:", error);
    return {
      success: false,
      error: "Error al crear el medicamento",
    };
  }
}

// ==================== CASO DE USO: OBTENER MEDICAMENTOS DEL DONADOR ====================

export async function getMedicationsByDonor(donorId: string) {
  try {
    const medications = await db
      .select()
      .from(medication)
      .where(eq(medication.donorId, donorId))
      .orderBy(medication.createdAt);

    return {
      success: true,
      medications,
    };
  } catch (error) {
    console.error("Error fetching medications:", error);
    return {
      success: false,
      medications: [],
      error: "Error al obtener los medicamentos",
    };
  }
}

// ==================== CASO DE USO: OBTENER MEDICAMENTO POR ID ====================

export async function getMedicationById(id: number) {
  try {
    const [med] = await db
      .select()
      .from(medication)
      .where(eq(medication.id, id));

    if (!med) {
      return {
        success: false,
        error: "Medicamento no encontrado",
      };
    }

    return {
      success: true,
      medication: med,
    };
  } catch (error) {
    console.error("Error fetching medication:", error);
    return {
      success: false,
      error: "Error al obtener el medicamento",
    };
  }
}

// ==================== CASO DE USO: ACTUALIZAR ESTADO DEL MEDICAMENTO ====================

export async function updateMedicationStatus(
  id: number,
  status: "disponible" | "reservado" | "entregado" | "cancelado"
) {
  try {
    const [updated] = await db
      .update(medication)
      .set({ status, updatedAt: new Date() })
      .where(eq(medication.id, id))
      .returning();

    if (!updated) {
      return {
        success: false,
        error: "Medicamento no encontrado",
      };
    }

    return {
      success: true,
      medication: updated,
    };
  } catch (error) {
    console.error("Error updating medication status:", error);
    return {
      success: false,
      error: "Error al actualizar el estado del medicamento",
    };
  }
}
