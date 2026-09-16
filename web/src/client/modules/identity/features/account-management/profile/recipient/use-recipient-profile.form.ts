import { useAppForm } from "@/client/components/forms/form-context";
import {
  useCreateRecipientProfile,
  useUpdateRecipientProfile,
} from "@/client/modules/identity/hooks/use-profile.hooks";
import {
  RecipientProfilePayload,
  recipientProfileSchema,
} from "./recipient-profile.schema";

interface UseRecipientProfileFormOptions {
  initialData?: Partial<RecipientProfilePayload>;
  onSuccess?: () => void;
}

export function useRecipientProfileForm({
  initialData,
  onSuccess,
}: UseRecipientProfileFormOptions = {}) {
  const createMutation = useCreateRecipientProfile({ onSuccess });

  const updateMutation = useUpdateRecipientProfile({ onSuccess });

  return useAppForm({
    defaultValues: {
      // ===== Información personal =====
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      dateOfBirth: initialData?.dateOfBirth
        ? new Date(initialData.dateOfBirth)
        : undefined,

      // ===== Tipo de beneficiario  =====
      recipientType: initialData?.recipientType || "individual",

      // ===== Información adicional =====
      idDocument: initialData?.idDocument || "",
      socialSecurityNumber: initialData?.socialSecurityNumber || "",

      // ===== Dirección =====
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      country: initialData?.country || "México",

      // ===== Información socioeconómica =====
      employmentStatus: initialData?.employmentStatus || undefined,
      monthlyIncome: initialData?.monthlyIncome || undefined,

      hasHealthInsurance: initialData?.hasHealthInsurance ?? false,
      insuranceProvider: initialData?.insuranceProvider || "",

      // ===== Información médica =====
      chronicConditions: initialData?.chronicConditions || "",
      allergies: initialData?.allergies || "",
      currentMedications: initialData?.currentMedications || "",
      disabilities: initialData?.disabilities || "",

      // ===== Verificación =====
      economicProof: initialData?.economicProof || "",
      verificationDocument: initialData?.verificationDocument || "",
    } as RecipientProfilePayload,
    validators: {
      // @ts-expect-error: Zod coerce types mismatch con form state inicial es común
      onChange: recipientProfileSchema,
      // @ts-expect-error: Same mismatch
      onSubmit: recipientProfileSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        // Transformar dateOfBirth de Date a ISO string
        dateOfBirth: value.dateOfBirth?.toISOString() || undefined,

        // Limpiar campos opcionales vacíos
        phone: value.phone || undefined,
        socialSecurityNumber: value.socialSecurityNumber || undefined,
        insuranceProvider: value.insuranceProvider || undefined,
        chronicConditions: value.chronicConditions || undefined,
        allergies: value.allergies || undefined,
        currentMedications: value.currentMedications || undefined,
        disabilities: value.disabilities || undefined,
        economicProof: value.economicProof || undefined,
        verificationDocument: value.verificationDocument || undefined,
      };

      if (initialData == null) return createMutation.mutate(payload);

      return updateMutation.mutate(payload);
    },
  });
}
