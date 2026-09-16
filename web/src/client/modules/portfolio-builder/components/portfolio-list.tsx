"use client";

import { usePortfolios } from "../hooks/use-portfolios.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Button } from "@/client/components/ui/button";
import { Skeleton } from "@/client/components/ui/skeleton";
import { PlusIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import type { Portfolio } from "@/client/types/domain.types";

function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <TrendingUpIcon className="h-5 w-5 text-primary" />
          <span className="text-xs text-muted-foreground">
            λ = {portfolio.riskAversionLambda ?? "—"}
          </span>
        </div>
        <CardTitle className="text-base">{portfolio.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Capital:{" "}
          {portfolio.capital
            ? Number(portfolio.capital).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
                maximumFractionDigits: 0,
              })
            : "No especificado"}
        </p>
        <Button asChild size="sm" className="w-full">
          <Link href={`/portfolios/${portfolio.id}`}>Abrir</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function PortfolioList() {
  const { data: portfolios, isPending, isError } = usePortfolios();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">Error al cargar portafolios. Recarga la página.</p>
    );
  }

  if (!portfolios?.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <TrendingUpIcon className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Aún no tienes portafolios.</p>
        <Button asChild>
          <Link href="/portfolios/new">
            <PlusIcon className="mr-2 h-4 w-4" /> Crear primer portafolio
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {portfolios.map((p) => (
        <PortfolioCard key={p.id} portfolio={p} />
      ))}
    </div>
  );
}
