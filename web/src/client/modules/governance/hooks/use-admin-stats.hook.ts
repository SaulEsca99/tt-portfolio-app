// eslint-disable-next-line no-restricted-imports
import { getAdminStats } from "@/server/modules/governance/features/admin/actions/admin-stats.actions";
import { useQuery } from "@tanstack/react-query";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    refetchInterval: 60000,
  });
}
