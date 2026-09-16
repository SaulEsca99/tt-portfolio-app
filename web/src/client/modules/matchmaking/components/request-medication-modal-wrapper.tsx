"use client";

import { RequestMedicationModal } from "./request-medication-modal";
import { useRequestMedicationModal } from "../hooks/use-request-medication-modal";

export function RequestMedicationModalWrapper() {
    const modal = useRequestMedicationModal();

    if (!modal.isOpen || !modal.medicationId) {
        return null;
    }

    return (
        <RequestMedicationModal
            isOpen={modal.isOpen}
            onClose={modal.onClose}
            medicationId={modal.medicationId}
            medicationName={modal.medicationName || ""}
            medicationDosage={modal.medicationDosage || ""}
            isControlled={modal.isControlled || false}
        />
    );
}
