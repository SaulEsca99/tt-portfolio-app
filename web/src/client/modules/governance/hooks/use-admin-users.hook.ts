// eslint-disable-next-line no-restricted-imports
import {
  banUser,
  getAdminUsers,
  unbanUser,
} from "@/server/modules/governance/features/admin/actions/admin-users.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAdminUsers(params: {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => getAdminUsers(params),
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      reason,
      expiresAt,
    }: {
      userId: string;
      reason: string;
      expiresAt?: Date;
    }) => banUser(userId, reason, expiresAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
