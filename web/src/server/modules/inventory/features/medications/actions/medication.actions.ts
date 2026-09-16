"use server";

import { revalidatePath } from "next/cache";

import {
    createMedication,
    getMedicationById,
    getMedicationsByDonor,
    updateMedicationStatus,
} from "@server/modules/inventory/features/medications/use-cases/medication.use-cases";
import {
    listAvailableMedications,
    searchBySubstanceAndDosage,
    searchMedications,
} from "@server/modules/inventory/features/medications/use-cases/search-medications.use-case";

import type {
    CreateMedicationDto,
    SearchMedicationsDto,
} from "@server/modules/inventory/features/medications/dtos/medication.dto";

// ==================== SERVER ACTION: CREAR MEDICAMENTO ====================

export async function createMedicationAction(
    donorId: string,
    data: CreateMedicationDto
) {
    const result = await createMedication(donorId, data);

    if (result.success) {
        revalidatePath("/medications");
        revalidatePath("/dashboard");
    }

    return result;
}

// ==================== SERVER ACTION: OBTENER MEDICAMENTOS DEL DONADOR ====================

export async function getMedicationsByDonorAction(donorId: string) {
    return await getMedicationsByDonor(donorId);
}

// ==================== SERVER ACTION: OBTENER MEDICAMENTO POR ID ====================

export async function getMedicationByIdAction(id: number) {
    return await getMedicationById(id);
}

// ==================== SERVER ACTION: ACTUALIZAR ESTADO ====================

export async function updateMedicationStatusAction(
    id: number,
    status: "disponible" | "reservado" | "entregado" | "cancelado"
) {
    const result = await updateMedicationStatus(id, status);

    if (result.success) {
        revalidatePath("/medications");
        revalidatePath(`/medications/${id}`);
        revalidatePath("/dashboard");
    }

    return result;
}

// ==================== SERVER ACTION: BUSCAR MEDICAMENTOS ====================

export async function searchMedicationsAction(filters: SearchMedicationsDto) {
    return await searchMedications(filters);
}

// ==================== SERVER ACTION: LISTAR DISPONIBLES ====================

export async function listAvailableMedicationsAction() {
    return await listAvailableMedications();
}

// ==================== SERVER ACTION: BUSCAR POR SUSTANCIA Y GRAMAJE ====================

export async function searchBySubstanceAndDosageAction(
    activeSubstance: string,
    dosage?: string
) {
    return await searchBySubstanceAndDosage(activeSubstance, dosage);
}
