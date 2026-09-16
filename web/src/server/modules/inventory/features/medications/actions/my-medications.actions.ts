import { auth } from "@/app/lib/auth";
import { db } from "@/server/db";
import { medication } from "@/server/modules/inventory/infrastructure/db/medication.schema";
import { medicationRequest } from "@/server/modules/matchmaking/infrastructure/db/medication-request.schema";
import { user } from "@/server/db/schema";
import { eq, desc, and, count, getTableColumns } from "drizzle-orm";
import { headers } from "next/headers";

// ==================== CASO DE USO: OBTENER MIS MEDICAMENTOS ====================

export async function getMyMedicationsAction() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            return {
                success: false,
                error: "No autenticado",
                medications: [],
            };
        }

        // Obtener medicamentos del usuario con información del donador
        const medications = await db
            .select({
                ...getTableColumns(medication),
                donor: {
                    name: user.name,
                    image: user.image,
                },
            })
            .from(medication)
            .innerJoin(user, eq(medication.donorId, user.id))
            .where(eq(medication.donorId, session.user.id))
            .orderBy(desc(medication.createdAt));

        // Agregar contador de solicitudes pendientes para cada medicamento
        const medicationsWithRequests = await Promise.all(
            medications.map(async (med) => {
                const requestsCountResult = await db
                    .select({ count: count() })
                    .from(medicationRequest)
                    .where(
                        and(
                            eq(medicationRequest.medicationId, med.id),
                            eq(medicationRequest.status, "pending")
                        )
                    );

                return {
                    ...med,
                    requestsCount: requestsCountResult[0]?.count || 0,
                };
            })
        );

        return {
            success: true,
            medications: medicationsWithRequests,
            total: medicationsWithRequests.length,
        };
    } catch (error) {
        console.error("Error getting my medications:", error);
        return {
            success: false,
            error: "Error al obtener medicamentos",
            medications: [],
        };
    }
}
