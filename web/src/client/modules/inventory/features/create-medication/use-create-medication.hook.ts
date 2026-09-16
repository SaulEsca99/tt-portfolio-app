import { useAppForm } from "@/client/components/forms/form-context";

import { usePublishMedication } from "../../hooks/use-medications.hook";
import { createMedicationSchema } from "./create-medication.schema";

interface UseCreateMedicationOptions {
  donorId: string;
  onSuccess?: () => void;
}

export function useCreateMedication({
  donorId,
  onSuccess,
}: UseCreateMedicationOptions) {
  const mutation = usePublishMedication({ onSuccess });

  return useAppForm({
    defaultValues: {
      activeSubstance: "",
      dosage: "",
      presentation: "",
      brand: "",
      quantity: 1,
      isControlled: false,
      expiryDate: new Date(),
      lotNumber: "",
      laboratory: "",
      location: "",
      postalCode: "",
      description: "",
      notes: "",
      preferredSchedule: "",
      photoUrl: "",
    },
    validators: {
      // @ts-expect-error: Zod coerce types are loose, Form types are strict. This is safe.
      onChange: createMedicationSchema,
      // @ts-expect-error: Same logic
      onSubmit: createMedicationSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        donorId,
        brand: value.brand || undefined,
        presentation: value.presentation || undefined,
        lotNumber: value.lotNumber || undefined,
        laboratory: value.laboratory || undefined,
        postalCode: value.postalCode || undefined,
        description: value.description || undefined,
        notes: value.notes || undefined,
      };

      mutation.mutate(payload);
    },
  });
}
