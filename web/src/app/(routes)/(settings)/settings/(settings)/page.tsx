import { auth } from "@/app/lib/auth";
import { guardAuth } from "@/app/lib/auth-guard";

import { GeneralPage } from "@/client/modules/identity/features/account-management/general/general.page";
import { headers } from "next/headers";

export default async function Settings() {
  const { session } = await guardAuth();

  const [sessions, accounts] = await Promise.all([
    auth.api.listSessions({ headers: await headers() }),
    auth.api.listUserAccounts({
      headers: await headers(),
    }),
  ]);

  const nonCredentialAccounts = accounts.filter(
    (a) => a.providerId !== "credential"
  );

  return (
    <GeneralPage
      user={session!.user}
      sessions={sessions}
      currentAccounts={nonCredentialAccounts}
    />
  );
}
