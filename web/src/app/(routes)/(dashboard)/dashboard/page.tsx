import { getSession } from "@/app/lib/auth";
import { getQueryClient } from "@/client/lib/get-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PortfolioList } from "@/client/modules/portfolio-builder/components/portfolio-list";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  const queryClient = getQueryClient();

  // Prefetch de portafolios en el servidor para SSR
  await queryClient.prefetchQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      // En el servidor usamos la acción directamente
      const { db } = await import("@/server/db");
      const { portfolioTable } = await import("@/server/db/domain.schema");
      const { eq } = await import("drizzle-orm");
      return db
        .select()
        .from(portfolioTable)
        .where(eq(portfolioTable.userId, session!.user.id));
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mis portafolios</h1>
            <p className="text-muted-foreground text-sm">
              Gestiona, optimiza y evalúa tus carteras de inversión.
            </p>
          </div>
          <Button asChild>
            <Link href="/portfolios/new">
              <PlusIcon className="mr-2 h-4 w-4" /> Nuevo portafolio
            </Link>
          </Button>
        </div>

        <PortfolioList />
      </div>
    </HydrationBoundary>
  );
}
