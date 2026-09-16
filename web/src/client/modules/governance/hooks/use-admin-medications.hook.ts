// eslint-disable-next-line no-restricted-imports
import {
  deleteMedication,
  getAdminMedications,
} from "@/server/modules/governance/features/admin/actions/admin-medications.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAdminMedications(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["admin-medications", params],
    queryFn: () => getAdminMedications(params),
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medications"] });
    },
  });
}
