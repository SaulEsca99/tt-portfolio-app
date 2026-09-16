import { db } from "@/server/db";
import { medicationRequest } from "@/server/modules/matchmaking/infrastructure/db/medication-request.schema";
import { medication } from "@/server/modules/inventory/infrastructure/db/medication.schema";
import type {
    CreateMedicationRequestDTO,
} from "../dtos/medication-request.dto";
import { eq, and, desc } from "drizzle-orm";
import { addDays } from "date-fns";

type UseCaseResult<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

export class MedicationRequestUseCases {
    /**
     * Create a new medication request
     */
    async createRequest(
        data: CreateMedicationRequestDTO,
        requesterId: string
    ): Promise<UseCaseResult> {
        try {
            // 1. Verify medication exists and is available
            const med = await db.query.medication.findFirst({
                where: eq(medication.id, data.medicationId),
            });

            if (!med) {
                return { success: false, error: "Medicamento no encontrado" };
            }

            if (med.status !== "disponible") {
                return {
                    success: false,
                    error: "Este medicamento ya no está disponible",
                };
            }

            // 2. Verify user is not requesting their own medication
            if (med.donorId === requesterId) {
                return {
                    success: false,
                    error: "No puedes solicitar tu propio medicamento",
                };
            }

            // 3. Check if user already has a pending request for this medication
            const existingRequest = await db.query.medicationRequest.findFirst({
                where: and(
                    eq(medicationRequest.medicationId, data.medicationId),
                    eq(medicationRequest.requesterId, requesterId),
                    eq(medicationRequest.status, "pending")
                ),
            });

            if (existingRequest) {
                return {
                    success: false,
                    error: "Ya tienes una solicitud pendiente para este medicamento",
                };
            }

            // 4. Create the request
            const expiresAt = addDays(new Date(), 7); // Expires in 7 days

            const [newRequest] = await db
                .insert(medicationRequest)
                .values({
                    medicationId: data.medicationId,
                    requesterId,
                    requesterName: data.requesterName,
                    requesterPhone: data.requesterPhone,
                    medicalSituation: data.medicalSituation,
                    urgencyLevel: data.urgencyLevel,
                    status: "pending",
                    requestedAt: new Date(),
                    expiresAt,
                })
                .returning();

            return { success: true, data: newRequest };
        } catch (error) {
            console.error("[MedicationRequestUseCases] Error creating request:", error);
            return { success: false, error: "Error al crear la solicitud" };
        }
    }

    /**
     * Get all requests for a specific medication (for donors)
     */
    async getRequestsForMedication(
        medicationId: number,
        donorId: string
    ): Promise<UseCaseResult<unknown[]>> {
        try {
            // 1. Verify the medication belongs to the donor
            const med = await db.query.medication.findFirst({
                where: eq(medication.id, medicationId),
            });

            if (!med) {
                return { success: false, error: "Medicamento no encontrado" };
            }

            if (med.donorId !== donorId) {
                return {
                    success: false,
                    error: "No tienes permiso para ver estas solicitudes",
                };
            }

            // 2. Get all requests for this medication
            const requests = await db.query.medicationRequest.findMany({
                where: eq(medicationRequest.medicationId, medicationId),
                orderBy: [desc(medicationRequest.requestedAt)],
            });

            // 3. Rank requests by urgency and socioeconomic score
            const rankedRequests = requests.sort((a, b) => {
                const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                const urgencyA = urgencyOrder[a.urgencyLevel as keyof typeof urgencyOrder];
                const urgencyB = urgencyOrder[b.urgencyLevel as keyof typeof urgencyOrder];

                if (urgencyA !== urgencyB) {
                    return urgencyB - urgencyA;
                }

                return (b.socioeconomicScore || 0) - (a.socioeconomicScore || 0);
            });

            return { success: true, data: rankedRequests };
        } catch (error) {
            console.error("[MedicationRequestUseCases] Error getting requests:", error);
            return { success: false, error: "Error al obtener las solicitudes" };
        }
    }

    /**
     * Get all requests made by a user
     */
    async getMyRequests(
        requesterId: string
    ): Promise<UseCaseResult<unknown[]>> {
        try {
            const requests = await db.query.medicationRequest.findMany({
                where: eq(medicationRequest.requesterId, requesterId),
                orderBy: [desc(medicationRequest.requestedAt)],
                with: {
                    medication: {
                        with: {
                            donor: true,
                        },
                    },
                },
            });

            return { success: true, data: requests };
        } catch (error) {
            console.error("[MedicationRequestUseCases] Error getting my requests:", error);
            return { success: false, error: "Error al obtener tus solicitudes" };
        }
    }

    /**
     * Accept a request (donor accepts a specific request)
     */
    async acceptRequest(
        requestId: string,
        donorId: string
    ): Promise<UseCaseResult> {
        try {
            // 1. Get the request
            const request = await db.query.medicationRequest.findFirst({
                where: eq(medicationRequest.id, requestId),
            });

            if (!request) {
                return { success: false, error: "Solicitud no encontrada" };
            }

            if (request.status !== "pending") {
                return { success: false, error: "Esta solicitud ya fue procesada" };
            }

            // 2. Verify the medication belongs to the donor
            const med = await db.query.medication.findFirst({
                where: eq(medication.id, request.medicationId),
            });

            if (!med || med.donorId !== donorId) {
                return {
                    success: false,
                    error: "No tienes permiso para aceptar esta solicitud",
                };
            }

            // 3. Use transaction to:
            //    - Accept this request
            //    - Reject all other pending requests for this medication
            //    - Update medication status to "reservado"
            await db.transaction(async (tx) => {
                // Accept this request
                await tx
                    .update(medicationRequest)
                    .set({
                        status: "accepted",
                        respondedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(medicationRequest.id, requestId));

                // Reject all other pending requests
                await tx
                    .update(medicationRequest)
                    .set({
                        status: "rejected",
                        respondedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(medicationRequest.medicationId, request.medicationId),
                            eq(medicationRequest.status, "pending")
                        )
                    );

                // Update medication status
                await tx
                    .update(medication)
                    .set({ status: "reservado" })
                    .where(eq(medication.id, request.medicationId));
            });

            return { success: true, data: { requestId } };
        } catch (error) {
            console.error("[MedicationRequestUseCases] Error accepting request:", error);
            return { success: false, error: "Error al aceptar la solicitud" };
        }
    }

    /**
     * Reject a request
     */
    async rejectRequest(
        requestId: string,
        donorId: string
    ): Promise<UseCaseResult> {
        try {
            // 1. Get the request
            const request = await db.query.medicationRequest.findFirst({
                where: eq(medicationRequest.id, requestId),
            });

            if (!request) {
                return { success: false, error: "Solicitud no encontrada" };
            }

            if (request.status !== "pending") {
                return { success: false, error: "Esta solicitud ya fue procesada" };
            }

            // 2. Verify the medication belongs to the donor
            const med = await db.query.medication.findFirst({
                where: eq(medication.id, request.medicationId),
            });

            if (!med || med.donorId !== donorId) {
                return {
                    success: false,
                    error: "No tienes permiso para rechazar esta solicitud",
                };
            }

            // 3. Reject the request
            await db
                .update(medicationRequest)
                .set({
                    status: "rejected",
                    respondedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(medicationRequest.id, requestId));

            return { success: true, data: { requestId } };
        } catch (error) {
            console.error("[MedicationRequestUseCases] Error rejecting request:", error);
            return { success: false, error: "Error al rechazar la solicitud" };
        }
    }

    /**
     * Cancel a request (requester cancels their own request)
     */
    async cancelRequest(
        requestId: string,
        requesterId: string
    ): Promise<UseCaseResult> {
        try {
            // 1. Get the request
            const request = await db.query.medicationRequest.findFirst({
                where: eq(medicationRequest.id, requestId),
            });

            if (!request) {
                return { success: false, error: "Solicitud no encontrada" };
            }

            if (request.requesterId !== requesterId) {
                return {
                    success: false,
                    error: "No tienes permiso para cancelar esta solicitud",
                };
            }

            if (request.status !== "pending") {
                return { success: false, error: "Esta solicitud ya fue procesada" };
            }

            // 2. Cancel the request
            await db
                .update(medicationRequest)
                .set({
                    status: "cancelled",
                    updatedAt: new Date(),
                })
                .where(eq(medicationRequest.id, requestId));

            return { success: true, data: { requestId } };
        } catch (error) {
            console.error("[MedicationRequestUseCases] Error cancelling request:", error);
            return { success: false, error: "Error al cancelar la solicitud" };
        }
    }

    /**
     * Count pending requests for a medication
     */
    async countPendingRequests(
        medicationId: number
    ): Promise<number> {
        try {
            const requests = await db.query.medicationRequest.findMany({
                where: and(
                    eq(medicationRequest.medicationId, medicationId),
                    eq(medicationRequest.status, "pending")
                ),
            });

            return requests.length;
        } catch (error) {
            console.error("[MedicationRequestUseCases] Error counting requests:", error);
            return 0;
        }
    }
}

export const medicationRequestUseCases = new MedicationRequestUseCases();
