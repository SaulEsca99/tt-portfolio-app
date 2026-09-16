"use server";

import { auth } from "@/app/lib/auth";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { headers } from "next/headers";

export async function getAdminUsers(params: {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const {
    page,
    pageSize,
    search,
    role,
    status,
    type,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(like(user.name, `%${search}%`), like(user.email, `%${search}%`))
    );
  }
  if (role && role !== "all") {
    conditions.push(eq(user.role, role));
  }
  if (status === "active") {
    conditions.push(eq(user.banned, false));
  } else if (status === "banned") {
    conditions.push(eq(user.banned, true));
  }

  if (type === "donor") {
    conditions.push(eq(user.isDonor, true));
  } else if (type === "recipient") {
    conditions.push(eq(user.isBeneficiary, true));
  } else if (type === "both") {
    conditions.push(and(eq(user.isDonor, true), eq(user.isBeneficiary, true)));
  }

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(user)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Get paginated data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortColumn: any = user.createdAt;
  if (sortBy === "name") sortColumn = user.name;

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      isDonor: user.isDonor,
      isBeneficiary: user.isBeneficiary,
      banned: user.banned,
      banReason: user.banReason,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
    .limit(pageSize)
    .offset(offset);

  return {
    data: users,
    pageCount: Math.ceil(total / pageSize),
    total,
  };
}

export async function banUser(
  userId: string,
  reason: string,
  expiresAt?: Date
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(user)
    .set({
      banned: true,
      banReason: reason,
      banExpires: expiresAt,
    })
    .where(eq(user.id, userId));

  return { success: true };
}

export async function unbanUser(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(user)
    .set({
      banned: false,
      banReason: null,
      banExpires: null,
    })
    .where(eq(user.id, userId));

  return { success: true };
}
