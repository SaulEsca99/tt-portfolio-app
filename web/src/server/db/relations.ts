import { relations } from "drizzle-orm";
import { medicationRequest } from "@/server/modules/matchmaking/infrastructure/db/medication-request.schema";
import { medication } from "@/server/modules/inventory/infrastructure/db/medication.schema";
import { user } from "@/server/modules/identity/infrastructure/db/auth.schema";

export const medicationRequestRelations = relations(medicationRequest, ({ one }) => ({
    medication: one(medication, {
        fields: [medicationRequest.medicationId],
        references: [medication.id],
    }),
    requester: one(user, {
        fields: [medicationRequest.requesterId],
        references: [user.id],
    }),
}));

export const medicationRelations = relations(medication, ({ one, many }) => ({
    donor: one(user, {
        fields: [medication.donorId],
        references: [user.id],
    }),
    requests: many(medicationRequest),
}));
