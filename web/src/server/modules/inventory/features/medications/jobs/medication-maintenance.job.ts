import { and, eq, lte, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { medication } from "@server/modules/inventory/infrastructure/db/medication.schema";

// ==================== CRON JOB: OCULTAR MEDICAMENTOS PRÓXIMOS A CADUCAR (RF10) ====================

/**
 * Oculta automáticamente los medicamentos que caducan en menos de 30 días
 * Este job debe ejecutarse diariamente
 */
export async function hideExpiringMedications() {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Ocultar medicamentos que caducan en menos de 30 días
        const result = await db
            .update(medication)
            .set({
                isVisible: false,
                hiddenReason: "Caducidad menor a 30 días",
                updatedAt: new Date(),
            })
            .where(
                and(
                    lte(medication.expiryDate, thirtyDaysFromNow),
                    eq(medication.isVisible, true),
                    eq(medication.status, "disponible")
                )
            )
            .returning();

        console.log(`[CRON] Ocultados ${result.length} medicamentos próximos a caducar`);

        return {
            success: true,
            hiddenCount: result.length,
            medications: result,
        };
    } catch (error) {
        console.error("[CRON] Error hiding expiring medications:", error);
        return {
            success: false,
            hiddenCount: 0,
            error: "Error al ocultar medicamentos",
        };
    }
}

// ==================== CRON JOB: CANCELAR MEDICAMENTOS CADUCADOS ====================

/**
 * Cancela automáticamente los medicamentos que ya caducaron
 * Este job debe ejecutarse diariamente
 */
export async function cancelExpiredMedications() {
    try {
        const today = new Date();

        // Cancelar medicamentos caducados
        const result = await db
            .update(medication)
            .set({
                status: "cancelado",
                isVisible: false,
                hiddenReason: "Medicamento caducado",
                updatedAt: new Date(),
            })
            .where(
                and(
                    lte(medication.expiryDate, today),
                    eq(medication.status, "disponible")
                )
            )
            .returning();

        console.log(`[CRON] Cancelados ${result.length} medicamentos caducados`);

        return {
            success: true,
            canceledCount: result.length,
            medications: result,
        };
    } catch (error) {
        console.error("[CRON] Error canceling expired medications:", error);
        return {
            success: false,
            canceledCount: 0,
            error: "Error al cancelar medicamentos",
        };
    }
}

// ==================== FUNCIÓN COMBINADA PARA CRON ====================

/**
 * Ejecuta ambas tareas de mantenimiento de medicamentos
 * Debe ejecutarse diariamente (ej: a las 00:00)
 */
export async function runMedicationMaintenanceJobs() {
    console.log("[CRON] Iniciando mantenimiento de medicamentos...");

    const [hiddenResult, canceledResult] = await Promise.all([
        hideExpiringMedications(),
        cancelExpiredMedications(),
    ]);

    console.log("[CRON] Mantenimiento completado:", {
        hidden: hiddenResult.hiddenCount,
        canceled: canceledResult.canceledCount,
    });

    return {
        success: hiddenResult.success && canceledResult.success,
        hiddenCount: hiddenResult.hiddenCount,
        canceledCount: canceledResult.canceledCount,
    };
}
