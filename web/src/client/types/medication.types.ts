export interface Medication {
  id: number;
  donorId: string;
  activeSubstance: string;
  dosage: string;
  quantity: number;
  brand: string | null;
  presentation: string | null;
  expiryDate: string;
  lotNumber: string | null;
  laboratory: string | null;
  photoUrl: string | null;
  location: string;
  postalCode: string | null;
  preferredSchedule: string | null;
  status: "disponible" | "reservado" | "entregado" | "cancelado";
  description: string | null;
  notes: string | null;
  isVisible: boolean;
  hiddenReason: string | null;
  isControlled: boolean;
  createdAt: string;
  updatedAt: string;

  donor: {
    name: string | null;
    image: string | null;
  };
}

export interface CreateMedicationResponse {
  success: boolean;
  medicationId?: number;
  error?: string;
}
