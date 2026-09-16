import { apiFetch } from "@/client/lib/api-client";
import {
  CreateMedicationResponse,
  Medication,
} from "@/client/types/medication.types";

export function searchMedicationsService(queryParams: URLSearchParams) {
  return apiFetch<{ medications: Medication[]; total: number }>(
    `/api/inventory/medications?${queryParams.toString()}`
  );
}

export function createMedicationService(data: unknown) {
  return apiFetch<CreateMedicationResponse>("/api/inventory/medications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
