import { guardAuth } from "@/app/lib/auth-guard";
import { RecipientPage } from "@/client/modules/identity/features/account-management/profile/recipient/recipient-profile.page";

export default async function Recipient() {
  await guardAuth();

  return <RecipientPage />;
}
