import { db } from "@/server/db";
import { account } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { cache } from "react";

export const getLastPasswordUpdate = cache(async (userId: string) => {
  const credentialAccount = await db.query.account.findFirst({
    where: and(
      eq(account.userId, userId),
      eq(account.providerId, "credential")
    ),
    columns: {
      updatedAt: true,
      createdAt: true,
    },
  });

  if (!credentialAccount) return null;

  return credentialAccount.updatedAt;
});
