import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/lib/auth";
import { AUTH_ROUTES } from "@/client/config/routes";

export default async function DevSignOutPage() {
  if (process.env.NODE_ENV === "production") notFound();

  await auth.api.signOut({
    headers: await headers(),
  });

  redirect(AUTH_ROUTES.signIn);
}
