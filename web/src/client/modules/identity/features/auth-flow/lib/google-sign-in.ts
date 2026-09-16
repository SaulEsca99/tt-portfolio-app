import { authClient } from "@/app/lib/auth-client";

export function googleSignIn(callbackUrl: string) {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: callbackUrl,
  });
}
