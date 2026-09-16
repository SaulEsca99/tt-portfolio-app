/* eslint-disable no-restricted-imports */

import { SearchMedicationsDto } from "@/server/modules/inventory/features/medications/dtos/medication.dto";
import { queryOptions } from "@tanstack/react-query";
import { searchMedicationsService } from "../services/medications.service";

export const medicationQueries = {
  search: (filters: SearchMedicationsDto) => {
    const queryParams = new URLSearchParams();
    if (filters.activeSubstance)
      queryParams.set("activeSubstance", filters.activeSubstance);
    if (filters.status)
      queryParams.set("status", filters.status || "disponible");
    if (filters.onlyVisible !== undefined)
      queryParams.set("onlyVisible", String(filters.onlyVisible));
    if (filters.excludeOwnMedications !== undefined)
      queryParams.set("excludeOwnMedications", String(filters.excludeOwnMedications));

    return queryOptions({
      queryKey: ["medications", "search", filters],
      queryFn: () => searchMedicationsService(queryParams),
    });
  },
};
