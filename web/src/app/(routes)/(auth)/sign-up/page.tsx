import { guardGuest } from "@/app/lib/auth-guard";

import { SignUpPage } from "@/client/modules/identity/features/auth-flow/sign-up/sign-up.page";

export default async function SignUp() {
  await guardGuest();

  return <SignUpPage />;
}
