"use client";

import { useCreatePortfolioForm } from "./use-create-portfolio.hook";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Slider } from "@/client/components/ui/slider";

export function CreatePortfolioForm() {
  const { form, onSubmit, isPending } = useCreatePortfolioForm();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const lambda = watch("riskAversionLambda") ?? 1;

  return (
    <Card className="max-w-lg w-full">
      <CardHeader>
        <CardTitle>Nuevo portafolio</CardTitle>
        <CardDescription>
          Define las restricciones generales. Después agregarás los activos candidatos.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-1">
            <Label htmlFor="name">Nombre del portafolio</Label>
            <Input id="name" placeholder="Ej. Portafolio Tech 2025" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Capital */}
          <div className="space-y-1">
            <Label htmlFor="capital">Capital inicial (opcional, MXN / USD)</Label>
            <Input
              id="capital"
              type="number"
              placeholder="Ej. 100000"
              {...register("capital")}
            />
            {errors.capital && <p className="text-sm text-destructive">{errors.capital.message}</p>}
          </div>

          {/* Lambda */}
          <div className="space-y-2">
            <Label>
              Aversión al riesgo (λ = {lambda.toFixed(1)})
            </Label>
            <p className="text-xs text-muted-foreground">
              0 = máximo retorno esperado sin importar el riesgo · 10 = mínimo riesgo posible
            </p>
            <Slider
              min={0}
              max={10}
              step={0.1}
              value={[lambda]}
              onValueChange={([v]) => setValue("riskAversionLambda", v)}
            />
          </div>

          {/* Máximo de activos */}
          <div className="space-y-1">
            <Label htmlFor="maxAssets">Máximo de activos en la cartera (opcional)</Label>
            <Input
              id="maxAssets"
              type="number"
              min={2}
              max={50}
              placeholder="Ej. 10"
              {...register("maxAssets")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creando…" : "Crear portafolio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
