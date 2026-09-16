import { z } from "zod";

export const signInFormSchema = z.object({
  email: z.email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
  rememberMe: z.boolean(),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
