"use server";

import { auth } from "@/app/lib/auth";
import { db } from "@/server/db";
import { medication, medicationRequest, user } from "@/server/db/schema";
import { subDays } from "date-fns";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function getAdminStats() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const thirtyDaysAgo = subDays(new Date(), 30);

  // Total medications by status
  const medicationsStats = await db
    .select({
      status: medication.status,
      count: count(),
    })
    .from(medication)
    .groupBy(medication.status);

  // Total requests by status
  const requestsStats = await db
    .select({
      status: medicationRequest.status,
      count: count(),
    })
    .from(medicationRequest)
    .groupBy(medicationRequest.status);

  // Total requests by urgency
  const requestsByUrgency = await db
    .select({
      urgency: medicationRequest.urgencyLevel,
      count: count(),
    })
    .from(medicationRequest)
    .groupBy(medicationRequest.urgencyLevel);

  // Total users
  const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(user);

  // Users by type
  const [{ totalDonors }] = await db
    .select({ totalDonors: count() })
    .from(user)
    .where(eq(user.isDonor, true));

  const [{ totalRecipients }] = await db
    .select({ totalRecipients: count() })
    .from(user)
    .where(eq(user.isBeneficiary, true));

  // Medications published in last 30 days (by day)
  const medicationsByDay = await db
    .select({
      date: sql<string>`DATE(${medication.createdAt})`,
      count: count(),
    })
    .from(medication)
    .where(gte(medication.createdAt, thirtyDaysAgo))
    .groupBy(sql`DATE(${medication.createdAt})`)
    .orderBy(sql`DATE(${medication.createdAt})`);

  // Requests by day
  const requestsByDay = await db
    .select({
      date: sql<string>`DATE(${medicationRequest.requestedAt})`,
      count: count(),
    })
    .from(medicationRequest)
    .where(gte(medicationRequest.requestedAt, thirtyDaysAgo))
    .groupBy(sql`DATE(${medicationRequest.requestedAt})`)
    .orderBy(sql`DATE(${medicationRequest.requestedAt})`);

  // Top 10 active substances
  const topSubstances = await db
    .select({
      substance: medication.activeSubstance,
      count: count(),
    })
    .from(medication)
    .groupBy(medication.activeSubstance)
    .orderBy(desc(count()))
    .limit(10);

  return {
    medications: {
      total: medicationsStats.reduce(
        (acc, stat) => acc + Number(stat.count),
        0
      ),
      byStatus: medicationsStats,
      byDay: medicationsByDay,
    },
    requests: {
      total: requestsStats.reduce((acc, stat) => acc + Number(stat.count), 0),
      byStatus: requestsStats,
      byUrgency: requestsByUrgency,
      byDay: requestsByDay,
    },
    users: {
      total: totalUsers,
      donors: totalDonors,
      recipients: totalRecipients,
    },
    topSubstances,
  };
}
