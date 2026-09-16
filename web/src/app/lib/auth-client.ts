import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { adminOptions } from "@/server/modules/identity/infrastructure/auth-provider/admin.plugin";

import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [adminClient(adminOptions), inferAdditionalFields<typeof auth>()],
});

export type Session = typeof authClient.$Infer.Session;
