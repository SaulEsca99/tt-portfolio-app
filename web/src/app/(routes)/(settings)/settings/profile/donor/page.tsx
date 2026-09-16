import { guardAuth } from "@/app/lib/auth-guard";
import { DonorPage } from "@/client/modules/identity/features/account-management/profile/donor/donor-profile.page";

export default async function Donor() {
  await guardAuth();

  return <DonorPage />;
}
