"use server";

import { auth } from "@/app/lib/auth";
import { db } from "@/server/db";
import { medication, user } from "@/server/db/schema";
import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { headers } from "next/headers";

export async function getAdminMedications(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
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
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(medication.activeSubstance, `%${search}%`),
        like(medication.brand, `%${search}%`)
      )
    );
  }
  if (status) {
    conditions.push(eq(medication.status, status));
  }

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(medication)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Get paginated data with donor info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortColumn: any = medication.createdAt;
  if (sortBy === "expiryDate") sortColumn = medication.expiryDate;
  if (sortBy === "quantity") sortColumn = medication.quantity;

  const medications = await db
    .select({
      id: medication.id,
      activeSubstance: medication.activeSubstance,
      dosage: medication.dosage,
      quantity: medication.quantity,
      brand: medication.brand,
      status: medication.status,
      expiryDate: medication.expiryDate,
      location: medication.location,
      postalCode: medication.postalCode,
      isControlled: medication.isControlled,
      isVisible: medication.isVisible,
      photoUrl: medication.photoUrl,
      createdAt: medication.createdAt,
      donor: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(medication)
    .innerJoin(user, eq(medication.donorId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
    .limit(pageSize)
    .offset(offset);

  return {
    data: medications,
    pageCount: Math.ceil(total / pageSize),
    total,
  };
}

export async function deleteMedication(id: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.delete(medication).where(eq(medication.id, id));

  return { success: true };
}
