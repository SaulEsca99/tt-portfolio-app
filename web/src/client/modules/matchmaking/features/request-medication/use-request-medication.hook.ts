/* eslint-disable no-restricted-imports */

import { useAppForm } from "@/client/components/forms/form-context";
import {
  CreateMedicationRequestDTO,
  createMedicationRequestSchema,
} from "@/server/modules/matchmaking/features/requests/dtos/medication-request.dto";
import { useCreateRequest } from "../../hooks/use-medication-requests.hook";

interface UseRequestMedicationOptions {
  medicationId: number;
  onSuccess?: () => void;
}

export function useRequestMedication({
  medicationId,
  onSuccess,
}: UseRequestMedicationOptions) {
  const mutation = useCreateRequest({ onSuccess });

  return useAppForm({
    defaultValues: {
      medicationId,
      requesterName: "",
      requesterPhone: "",
      medicalSituation: "",
      urgencyLevel: "medium",
    } as CreateMedicationRequestDTO,
    validators: {
      onChange: createMedicationRequestSchema,
      onSubmit: createMedicationRequestSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });
}
