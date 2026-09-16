import { create } from "zustand";

interface RequestMedicationModalState {
    isOpen: boolean;
    medicationId?: number;
    medicationName?: string;
    medicationDosage?: string;
    isControlled?: boolean;
    onOpen: (data: {
        medicationId: number;
        medicationName: string;
        medicationDosage: string;
        isControlled: boolean;
    }) => void;
    onClose: () => void;
}

export const useRequestMedicationModal = create<RequestMedicationModalState>(
    (set) => ({
        isOpen: false,
        medicationId: undefined,
        medicationName: undefined,
        medicationDosage: undefined,
        isControlled: undefined,
        onOpen: (data) => set({ isOpen: true, ...data }),
        onClose: () =>
            set({
                isOpen: false,
                medicationId: undefined,
                medicationName: undefined,
                medicationDosage: undefined,
                isControlled: undefined,
            }),
    })
);
