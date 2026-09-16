// eslint-disable-next-line no-restricted-imports
import {
  getAdminRequests,
  updateRequestStatus,
} from "@/server/modules/governance/features/admin/actions/admin-requests.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAdminRequests(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  urgencyLevel?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["admin-requests", params],
    queryFn: () => getAdminRequests(params),
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
  });
}
