"use server";

import { auth } from "@/app/lib/auth";
import { db } from "@/server/db";
import { medication, medicationRequest, user } from "@/server/db/schema";
import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { headers } from "next/headers";

export async function getAdminRequests(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  urgencyLevel?: string;
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
    urgencyLevel,
    sortBy = "requestedAt",
    sortOrder = "desc",
  } = params;
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(medicationRequest.requesterName, `%${search}%`),
        like(medicationRequest.requesterPhone, `%${search}%`),
        like(medication.activeSubstance, `%${search}%`)
      )
    );
  }
  if (status) {
    conditions.push(
      eq(
        medicationRequest.status,
        status as "pending" | "accepted" | "rejected" | "cancelled" | "expired"
      )
    );
  }
  if (urgencyLevel) {
    conditions.push(
      eq(
        medicationRequest.urgencyLevel,
        urgencyLevel as "low" | "medium" | "high" | "critical"
      )
    );
  }

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(medicationRequest)
    .innerJoin(medication, eq(medicationRequest.medicationId, medication.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Get paginated data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortColumn: any = medicationRequest.requestedAt;
  if (sortBy === "urgencyLevel") sortColumn = medicationRequest.urgencyLevel;
  if (sortBy === "score") sortColumn = medicationRequest.socioeconomicScore;

  const requests = await db
    .select({
      id: medicationRequest.id,
      requesterName: medicationRequest.requesterName,
      requesterPhone: medicationRequest.requesterPhone,
      medicalSituation: medicationRequest.medicalSituation,
      urgencyLevel: medicationRequest.urgencyLevel,
      socioeconomicScore: medicationRequest.socioeconomicScore,
      status: medicationRequest.status,
      requestedAt: medicationRequest.requestedAt,
      respondedAt: medicationRequest.respondedAt,
      medication: {
        id: medication.id,
        activeSubstance: medication.activeSubstance,
        dosage: medication.dosage,
        brand: medication.brand,
      },
      requester: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(medicationRequest)
    .innerJoin(medication, eq(medicationRequest.medicationId, medication.id))
    .innerJoin(user, eq(medicationRequest.requesterId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
    .limit(pageSize)
    .offset(offset);

  return {
    data: requests,
    pageCount: Math.ceil(total / pageSize),
    total,
  };
}

export async function updateRequestStatus(params: {
  requestId: string;
  status: "accepted" | "rejected";
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const { requestId, status } = params;

  await db
    .update(medicationRequest)
    .set({
      status,
      respondedAt: new Date(),
    })
    .where(eq(medicationRequest.id, requestId));

  return { success: true };
}
