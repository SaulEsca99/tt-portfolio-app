import Link from "next/link";
import { getSession } from "@/app/lib/auth";
import { Button } from "@/client/components/ui/button";
import { TrendingUpIcon, ShieldCheckIcon, BrainCircuitIcon, BarChart3Icon } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-5xl px-6 py-24 text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Optimización de carteras con&nbsp;
          <span className="text-primary">IA y algoritmos bioinspirados</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Construye, optimiza y evalúa tu portafolio de inversión usando Algoritmos Genéticos,
          PSO, Evolución Diferencial y predicciones LSTM — todo en un solo lugar.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {session?.user ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Ir al dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/sign-up">Comenzar gratis</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Iniciar sesión</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-5xl px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: BrainCircuitIcon,
            title: "Predicción LSTM",
            desc: "Estimación de retorno esperado y riesgo con redes neuronales recurrentes.",
          },
          {
            icon: TrendingUpIcon,
            title: "Optimización bioinspirada",
            desc: "GA, PSO y DE encuentran los pesos óptimos de tu portafolio.",
          },
          {
            icon: BarChart3Icon,
            title: "Walk-Forward Backtesting",
            desc: "Evalúa el desempeño real contra benchmarks con validación cruzada temporal.",
          },
          {
            icon: ShieldCheckIcon,
            title: "Datos frescos",
            desc: "Precios actualizados diariamente desde yfinance y Alpha Vantage.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border bg-card p-6 space-y-3">
            <Icon className="h-7 w-7 text-primary" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
