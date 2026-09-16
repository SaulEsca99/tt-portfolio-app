import { notFound } from "next/navigation";
import { getSession } from "@/app/lib/auth";
import { db } from "@/server/db";
import { portfolioTable, portfolioCandidateTable, assetTable } from "@/server/db/domain.schema";
import { eq, and } from "drizzle-orm";
import { OptimizationPanel } from "@/client/modules/optimization/components/optimization-panel";
import { AddAssetSection } from "@/client/modules/portfolio-builder/features/add-asset/add-asset-section";
import { Badge } from "@/client/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs";

interface Props {
  params: Promise<{ portfolioId: string }>;
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { portfolioId } = await params;
  const session = await getSession();

  // Cargar portafolio + candidatos en el servidor
  const [portfolio] = await db
    .select()
    .from(portfolioTable)
    .where(
      and(
        eq(portfolioTable.id, portfolioId),
        eq(portfolioTable.userId, session!.user.id),
      ),
    );

  if (!portfolio) notFound();

  const candidates = await db
    .select({ candidate: portfolioCandidateTable, asset: assetTable })
    .from(portfolioCandidateTable)
    .leftJoin(assetTable, eq(portfolioCandidateTable.assetId, assetTable.id))
    .where(eq(portfolioCandidateTable.portfolioId, portfolioId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{portfolio.name}</h1>
          <Badge variant="outline">λ = {portfolio.riskAversionLambda ?? "1.0"}</Badge>
          {portfolio.maxAssets && (
            <Badge variant="outline">Máx. {portfolio.maxAssets} activos</Badge>
          )}
        </div>
        {portfolio.capital && (
          <p className="text-sm text-muted-foreground">
            Capital:{" "}
            {Number(portfolio.capital).toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })}
          </p>
        )}
      </div>

      <Tabs defaultValue="optimize">
        <TabsList>
          <TabsTrigger value="candidates">
            Activos candidatos ({candidates.length})
          </TabsTrigger>
          <TabsTrigger value="optimize">Optimizar</TabsTrigger>
        </TabsList>

        {/* Tab: Candidatos */}
        <TabsContent value="candidates" className="space-y-4 pt-4">
          <AddAssetSection
            portfolioId={portfolioId}
            currentCandidates={candidates.map((c) => ({
              id: c.candidate.id,
              ticker: c.asset?.ticker ?? "",
              name: c.asset?.name ?? null,
              minWeight: c.candidate.minWeight,
              maxWeight: c.candidate.maxWeight,
            }))}
          />
        </TabsContent>

        {/* Tab: Optimizar */}
        <TabsContent value="optimize" className="pt-4">
          {candidates.length < 2 ? (
            <p className="text-sm text-muted-foreground">
              Agrega al menos 2 activos candidatos antes de optimizar.
            </p>
          ) : (
            <OptimizationPanel
              portfolioId={portfolioId}
              portfolioName={portfolio.name}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
