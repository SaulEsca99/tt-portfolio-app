import { guardGuest } from "@/app/lib/auth-guard";

import { SignInPage } from "@/client/modules/identity/features/auth-flow/sign-in/sign-in.page";

export default async function SignIn() {
  await guardGuest();

  return <SignInPage />;
}
