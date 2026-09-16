import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { authClient } from "@/app/lib/auth-client";
import { PUBLIC_ROUTES } from "@/client/config/routes";

import { useAppForm } from "@/client/components/forms/form-context";

import { signUpFormSchema } from "./sign-up.schema";

interface UseSignUpOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function useSignUp(options?: UseSignUpOptions) {
  const router = useRouter();

  const { onSuccess, redirectTo = PUBLIC_ROUTES.home } = options ?? {};

  return useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: signUpFormSchema,
      onSubmit: signUpFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { data, error } = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
        });

        if (error) return toast.error("Error al crear la cuenta");

        if (data) {
          toast.success("Cuenta creada exitosamente");

          if (onSuccess) {
            onSuccess();
          } else {
            router.push(redirectTo);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Ocurrió un error inesperado. Por favor, intenta de nuevo");
      }
    },
  });
}
