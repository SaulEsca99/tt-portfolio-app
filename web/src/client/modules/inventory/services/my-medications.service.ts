import { apiFetch } from "@/client/lib/api-client";
import { Medication } from "@/client/types/medication.types";

export function getMyMedicationsService() {
    return apiFetch<{
        success: boolean;
        medications: (Medication & { requestsCount: number })[];
        total: number;
    }>("/api/inventory/my-medications");
}
