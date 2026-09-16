import { useQuery } from "@tanstack/react-query";
import { getMyMedicationsService } from "../services/my-medications.service";

export function useMyMedications() {
    return useQuery({
        queryKey: ["my-medications"],
        queryFn: () => getMyMedicationsService(),
    });
}
