"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreatePortfolio } from "../hooks/use-portfolios.hook";

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  capital: z.coerce.number().positive("El capital debe ser positivo").optional(),
  riskAversionLambda: z.coerce
    .number()
    .min(0, "λ mínimo: 0")
    .max(10, "λ máximo: 10")
    .optional(),
  maxAssets: z.coerce.number().int().positive().optional(),
});

type FormValues = z.infer<typeof schema>;

export function useCreatePortfolioForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreatePortfolio();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      riskAversionLambda: 1,
      maxAssets: 10,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const portfolio = await mutateAsync(values);
      toast.success(`Portafolio "${portfolio.name}" creado.`);
      router.push(`/portfolios/${portfolio.id}`);
    } catch {
      toast.error("No se pudo crear el portafolio. Intenta de nuevo.");
    }
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), isPending };
}
