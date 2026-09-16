import { guardAdmin } from "@/app/lib/auth-guard";
import { AdminUsersPage } from "@/client/modules/governance/features/users/admin-users.page";

export default async function UsersPage() {
  await guardAdmin();

  return <AdminUsersPage />;
}
