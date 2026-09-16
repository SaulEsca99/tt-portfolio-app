import { guardAdmin } from "@/app/lib/auth-guard";
import { AdminDashboard } from "@/client/modules/governance/features/dashboard/dashboard-admin.page";

export default async function AdminPage() {
  await guardAdmin();

  return <AdminDashboard />;
}
