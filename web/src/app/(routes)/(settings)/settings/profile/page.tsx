import { guardAuth } from "@/app/lib/auth-guard";
import { ProfilePage } from "@/client/modules/identity/features/account-management/profile/profile.page";

export default async function Profile() {
  await guardAuth();

  return <ProfilePage />;
}
