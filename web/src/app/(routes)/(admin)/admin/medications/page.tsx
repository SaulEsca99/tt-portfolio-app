import { guardAdmin } from "@/app/lib/auth-guard";

import { AdminMedicationsPage } from "@/client/modules/governance/features/medication/admin-medication.page";

export default async function MedicationPage() {
  await guardAdmin();

  return <AdminMedicationsPage />;
}
