import { CreatePortfolioForm } from "@/client/modules/portfolio-builder/features/create-portfolio/create-portfolio.form";

export default function NewPortfolioPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Crear portafolio</h1>
        <p className="text-sm text-muted-foreground">
          Define las restricciones generales. Los activos candidatos se agregan en el siguiente paso.
        </p>
      </div>
      <CreatePortfolioForm />
    </div>
  );
}
