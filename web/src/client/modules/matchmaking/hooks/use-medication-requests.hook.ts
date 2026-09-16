/* eslint-disable no-restricted-imports */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { medicationRequestQueries } from "../queries/medication-request.queries";
import {
    createRequestService,
    acceptRequestService,
    rejectRequestService,
    cancelRequestService,
} from "../services/medication-request.service";
import type { CreateMedicationRequestDTO } from "@/server/modules/matchmaking/features/requests/dtos/medication-request.dto";

/**
 * Get all requests made by the current user
 */
export function useMyRequests() {
    return useQuery(medicationRequestQueries.myRequests());
}

/**
 * Get all requests for a specific medication (for donors)
 */
export function useRequestsForMedication(medicationId: number) {
    return useQuery(medicationRequestQueries.forMedication(medicationId));
}

/**
 * Get count of pending requests for a medication
 */
export function usePendingRequestsCount(medicationId: number) {
    return useQuery(medicationRequestQueries.pendingCount(medicationId));
}

/**
 * Create a new medication request
 */
export function useCreateRequest({ onSuccess }: { onSuccess?: () => void }) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMedicationRequestDTO) => createRequestService(data),
        onSuccess: (data) => {
            if (!data.success) {
                toast.error(data.error || "Error al crear solicitud");
                return;
            }

            toast.success("¡Solicitud enviada exitosamente!");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["medication-requests"] });
            queryClient.invalidateQueries({ queryKey: ["medications"] });

            onSuccess?.();
        },
        onError: (err) => {
            console.error("[useCreateRequest] Error:", err);
            toast.error("Error de conexión");
        },
    });
}

/**
 * Accept a medication request
 */
export function useAcceptRequest({ onSuccess }: { onSuccess?: () => void }) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) => acceptRequestService(requestId),
        onSuccess: (data) => {
            if (!data.success) {
                toast.error(data.error || "Error al aceptar solicitud");
                return;
            }

            toast.success("Solicitud aceptada. El receptor será notificado.");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["medication-requests"] });
            queryClient.invalidateQueries({ queryKey: ["medications"] });

            onSuccess?.();
        },
        onError: (err) => {
            console.error("[useAcceptRequest] Error:", err);
            toast.error("Error de conexión");
        },
    });
}

/**
 * Reject a medication request
 */
export function useRejectRequest({ onSuccess }: { onSuccess?: () => void }) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) => rejectRequestService(requestId),
        onSuccess: (data) => {
            if (!data.success) {
                toast.error(data.error || "Error al rechazar solicitud");
                return;
            }

            toast.success("Solicitud rechazada");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["medication-requests"] });

            onSuccess?.();
        },
        onError: (err) => {
            console.error("[useRejectRequest] Error:", err);
            toast.error("Error de conexión");
        },
    });
}

/**
 * Cancel a medication request (requester cancels their own request)
 */
export function useCancelRequest({ onSuccess }: { onSuccess?: () => void }) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) => cancelRequestService(requestId),
        onSuccess: (data) => {
            if (!data.success) {
                toast.error(data.error || "Error al cancelar solicitud");
                return;
            }

            toast.success("Solicitud cancelada");

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["medication-requests"] });
            queryClient.invalidateQueries({ queryKey: ["medications"] });

            onSuccess?.();
        },
        onError: (err) => {
            console.error("[useCancelRequest] Error:", err);
            toast.error("Error de conexión");
        },
    });
}
