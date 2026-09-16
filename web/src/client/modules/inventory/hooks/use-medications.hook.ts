/* eslint-disable no-restricted-imports */

import {
  CreateMedicationDto,
  SearchMedicationsDto,
} from "@/server/modules/inventory/features/medications/dtos/medication.dto";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { medicationQueries } from "../queries/medication.queries";
import { createMedicationService } from "../services/medications.service";

export function useMedications(filters: SearchMedicationsDto) {
  return useSuspenseQuery(medicationQueries.search(filters));
}

export function usePublishMedication({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateMedicationDto) => createMedicationService(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });

      if (!data.success) {
        toast.error(data.error || "Error al crear la donación");
        return;
      }
      toast.success("¡Medicamento donado exitosamente!");
      queryClient.invalidateQueries({ queryKey: ["medications"] });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/");
      }
    },

    onError: (err) => {
      console.error(err);
      toast.error("Error de conexión");
    },
  });
}
