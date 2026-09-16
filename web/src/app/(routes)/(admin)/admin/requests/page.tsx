import { guardAdmin } from "@/app/lib/auth-guard";
import { AdminRequestsPage } from "@/client/modules/governance/features/requests/admin-requests.page";

export default async function RequestsPage() {
  await guardAdmin();

  return <AdminRequestsPage />;
}
