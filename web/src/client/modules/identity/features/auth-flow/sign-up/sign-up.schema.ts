import { z } from "zod";

export const signUpFormSchema = z
  .object({
    name: z.string().min(2, "El nombre es requerido"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignUpValues = z.infer<typeof signUpFormSchema>;
