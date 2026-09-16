import { useAppForm } from "@/client/components/forms/form-context";
import {
  useCreateDonorProfile,
  useUpdateDonorProfile,
} from "@/client/modules/identity/hooks/use-profile.hooks";
import {
  DonorProfilePayload,
  donorProfileSchema,
} from "./donor-profile.schema";

interface UseDonorProfileFormOptions {
  initialData?: Partial<DonorProfilePayload>;
  onSuccess?: () => void;
}

export function useDonorProfileForm({
  initialData,
  onSuccess,
}: UseDonorProfileFormOptions = {}) {
  const createMutation = useCreateDonorProfile({ onSuccess });
  const updateMutation = useUpdateDonorProfile({ onSuccess });

  return useAppForm({
    defaultValues: {
      // ===== Información personal =====
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",

      // ===== Tipo de donante =====
      donorType: initialData?.donorType || undefined,

      // ===== Información adicional =====
      organization: initialData?.organization || "",
      idDocument: initialData?.idDocument || "",

      // ===== Información de dirección =====
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      country: initialData?.country || "México",

      // ===== Validación médica =====
      medicalLicense: initialData?.medicalLicense || "",

      // ===== Verificación =====
      verificationDocument: initialData?.verificationDocument || "",

      // ===== Configuración del perfil =====
      profilePicture: initialData?.profilePicture || "",
      bio: initialData?.bio || "",
    } as DonorProfilePayload,
    validators: {
      // @ts-expect-error: Zod coerce types mismatch con form state inicial es común
      onChange: donorProfileSchema,
      // @ts-expect-error: Same mismatch
      onSubmit: donorProfileSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        // Limpiar campos opcionales vacíos
        phone: value.phone || undefined,
        organization: value.organization || undefined,
        idDocument: value.idDocument || undefined,
        address: value.address || undefined,
        city: value.city || undefined,
        state: value.state || undefined,
        postalCode: value.postalCode || undefined,
        medicalLicense: value.medicalLicense || undefined,
        verificationDocument: value.verificationDocument || undefined,
        profilePicture: value.profilePicture || undefined,
        bio: value.bio || undefined,
      };

      if (initialData == null) return createMutation.mutate(payload);

      return updateMutation.mutate(payload);
    },
  });
}
