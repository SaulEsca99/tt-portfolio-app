"use server";

import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { medicationRequestUseCases } from "../use-cases/medication-request.use-cases";
import {
    createMedicationRequestSchema,
    updateRequestStatusSchema,
    type CreateMedicationRequestDTO,
} from "../dtos/medication-request.dto";

/**
 * Create a new medication request
 */
export async function createMedicationRequestAction(data: CreateMedicationRequestDTO) {
    try {
        // 1. Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return { success: false, error: "No autenticado" };
        }

        // 2. Validate data
        const validation = createMedicationRequestSchema.safeParse(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues[0]?.message || "Datos inválidos",
            };
        }

        // 3. Create request
        return await medicationRequestUseCases.createRequest(
            validation.data,
            session.user.id
        );
    } catch (error) {
        console.error("[createMedicationRequestAction] Error:", error);
        return { success: false, error: "Error al crear la solicitud" };
    }
}

/**
 * Get all requests for a medication (for donors)
 */
export async function getRequestsForMedicationAction(medicationId: number) {
    try {
        // 1. Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return { success: false, error: "No autenticado" };
        }

        // 2. Get requests
        return await medicationRequestUseCases.getRequestsForMedication(
            medicationId,
            session.user.id
        );
    } catch (error) {
        console.error("[getRequestsForMedicationAction] Error:", error);
        return { success: false, error: "Error al obtener las solicitudes" };
    }
}

/**
 * Get all requests made by the current user
 */
export async function getMyRequestsAction() {
    try {
        // 1. Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return { success: false, error: "No autenticado" };
        }

        // 2. Get requests
        return await medicationRequestUseCases.getMyRequests(session.user.id);
    } catch (error) {
        console.error("[getMyRequestsAction] Error:", error);
        return { success: false, error: "Error al obtener tus solicitudes" };
    }
}

/**
 * Accept a medication request
 */
export async function acceptRequestAction(requestId: string) {
    try {
        // 1. Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return { success: false, error: "No autenticado" };
        }

        // 2. Accept request
        return await medicationRequestUseCases.acceptRequest(
            requestId,
            session.user.id
        );
    } catch (error) {
        console.error("[acceptRequestAction] Error:", error);
        return { success: false, error: "Error al aceptar la solicitud" };
    }
}

/**
 * Reject a medication request
 */
export async function rejectRequestAction(requestId: string) {
    try {
        // 1. Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return { success: false, error: "No autenticado" };
        }

        // 2. Reject request
        return await medicationRequestUseCases.rejectRequest(
            requestId,
            session.user.id
        );
    } catch (error) {
        console.error("[rejectRequestAction] Error:", error);
        return { success: false, error: "Error al rechazar la solicitud" };
    }
}

/**
 * Cancel a medication request (requester cancels their own request)
 */
export async function cancelRequestAction(requestId: string) {
    try {
        // 1. Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return { success: false, error: "No autenticado" };
        }

        // 2. Cancel request
        return await medicationRequestUseCases.cancelRequest(
            requestId,
            session.user.id
        );
    } catch (error) {
        console.error("[cancelRequestAction] Error:", error);
        return { success: false, error: "Error al cancelar la solicitud" };
    }
}

/**
 * Count pending requests for a medication
 */
export async function countPendingRequestsAction(medicationId: number) {
    try {
        return await medicationRequestUseCases.countPendingRequests(medicationId);
    } catch (error) {
        console.error("[countPendingRequestsAction] Error:", error);
        return 0;
    }
}
