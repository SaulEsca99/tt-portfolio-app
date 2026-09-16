/* eslint-disable no-restricted-imports */

import {
    createMedicationRequestAction,
    acceptRequestAction,
    rejectRequestAction,
    cancelRequestAction,
} from "@/server/modules/matchmaking/features/requests/actions/medication-request.actions";
import type { CreateMedicationRequestDTO } from "@/server/modules/matchmaking/features/requests/dtos/medication-request.dto";

export async function createRequestService(data: CreateMedicationRequestDTO) {
    return await createMedicationRequestAction(data);
}

export async function acceptRequestService(requestId: string) {
    return await acceptRequestAction(requestId);
}

export async function rejectRequestService(requestId: string) {
    return await rejectRequestAction(requestId);
}

export async function cancelRequestService(requestId: string) {
    return await cancelRequestAction(requestId);
}
