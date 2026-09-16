/* eslint-disable no-restricted-imports */

import {
  countPendingRequestsAction,
  getMyRequestsAction,
  getRequestsForMedicationAction,
} from "@/server/modules/matchmaking/features/requests/actions/medication-request.actions";
import { queryOptions } from "@tanstack/react-query";

type Medication = {
  id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "expired";
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
  socioeconomicScore: number | null;
  medicationId: number;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  medicalSituation: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  requestedAt: Date;
  respondedAt: Date | null;
};

export const medicationRequestQueries = {
  all: () => ["medication-requests"] as const,

  myRequests: () =>
    queryOptions({
      queryKey: [...medicationRequestQueries.all(), "my-requests"] as const,
      queryFn: async () => {
        const result = await getMyRequestsAction();
        if (!result.success) throw new Error(result.error);
        return result;
      },
    }),

  forMedication: (medicationId: number) =>
    queryOptions({
      queryKey: [
        ...medicationRequestQueries.all(),
        "medication",
        medicationId,
      ] as const,
      queryFn: async () => {
        const result = await getRequestsForMedicationAction(medicationId);
        if (!result.success) throw new Error(result.error);
        return (result.data || []) as Medication[];
      },
    }),

  pendingCount: (medicationId: number) =>
    queryOptions({
      queryKey: [
        ...medicationRequestQueries.all(),
        "pending-count",
        medicationId,
      ] as const,
      queryFn: async () => {
        return await countPendingRequestsAction(medicationId);
      },
    }),
};
