import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SETTINGS_ROUTES } from "../config/routes";

interface UserContext {
  id: string;
  isDonor?: boolean;
}

export function useDonationValidator() {
  const router = useRouter();

  const validateAndExecute = (
    user: UserContext | null | undefined,
    action: () => void
  ) => {
    if (!user || !user.id) {
      toast.error("Inicia sesión para realizar una donación", {
        description: "Necesitamos saber quién eres para gestionar la donación.",
      });

      router.push("/sign-in?callbackUrl=/");
      return;
    }

    if (!user.isDonor) {
      toast.info("Perfil de donante requerido", {
        description: "Completa tus datos básicos para poder donar.",
        action: {
          label: "Completar",
          onClick: () => router.push(SETTINGS_ROUTES.profile.donor),
        },
      });
      router.push(SETTINGS_ROUTES.profile.donor);
      return;
    }

    action();
  };

  return {
    validateAndExecute,
  };
}
