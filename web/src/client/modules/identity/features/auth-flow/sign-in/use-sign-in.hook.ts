import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/app/lib/auth-client";
import { useAppForm } from "@/client/components/forms/form-context";
import { PUBLIC_ROUTES } from "@/client/config/routes";

import { signInFormSchema } from "./sign-in.schema";

interface UseSignInOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function useSignIn(options?: UseSignInOptions) {
  const router = useRouter();
  const { onSuccess, redirectTo = PUBLIC_ROUTES.home } = options ?? {};

  return useAppForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onChange: signInFormSchema,
      onSubmit: signInFormSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        const { data, error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
        });

        if (error) return toast.error("Error al iniciar sesión");

        if (data) {
          toast.success("¡Bienvenido de nuevo!");

          if (onSuccess) {
            onSuccess();
          } else {
            router.push(redirectTo);
            router.refresh();
          }
        }
      } catch (error) {
        toast.error("Ocurrió un error inesperado. Por favor, intenta de nuevo");
        console.error(error);
      }
    },
  });
}
