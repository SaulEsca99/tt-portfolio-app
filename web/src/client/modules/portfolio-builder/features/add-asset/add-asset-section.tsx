"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAddCandidate } from "@/client/modules/portfolio-builder/hooks/use-portfolios.hook";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { PlusIcon, TrendingUpIcon } from "lucide-react";

interface Candidate {
  id: string;
  ticker: string;
  name: string | null;
  minWeight: string | null;
  maxWeight: string | null;
}

interface Props {
  portfolioId: string;
  currentCandidates: Candidate[];
}

export function AddAssetSection({ portfolioId, currentCandidates }: Props) {
  const [ticker, setTicker] = useState("");
  const [minW, setMinW] = useState("");
  const [maxW, setMaxW] = useState("");
  const { mutateAsync, isPending } = useAddCandidate(portfolioId);

  async function handleAdd() {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    try {
      await mutateAsync({
        ticker: t,
        minWeight: minW ? parseFloat(minW) / 100 : undefined,
        maxWeight: maxW ? parseFloat(maxW) / 100 : undefined,
      });
      toast.success(`${t} agregado al portafolio.`);
      setTicker("");
      setMinW("");
      setMaxW("");
    } catch {
      toast.error(`No se pudo agregar ${t}. Verifica que el ticker sea válido.`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario de agregar */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-medium">Agregar activo candidato</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="ticker" className="text-xs">Ticker</Label>
            <Input
              id="ticker"
              className="w-28 uppercase"
              placeholder="AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="minW" className="text-xs">Peso mín. (%)</Label>
            <Input
              id="minW"
              className="w-24"
              type="number"
              min={0}
              max={100}
              placeholder="0"
              value={minW}
              onChange={(e) => setMinW(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="maxW" className="text-xs">Peso máx. (%)</Label>
            <Input
              id="maxW"
              className="w-24"
              type="number"
              min={0}
              max={100}
              placeholder="100"
              value={maxW}
              onChange={(e) => setMaxW(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd} disabled={isPending || !ticker.trim()} size="sm">
            <PlusIcon className="mr-1 h-4 w-4" />
            {isPending ? "Agregando…" : "Agregar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Al agregar un ticker por primera vez, el sistema descarga su historial
          automáticamente (puede tardar unos segundos).
        </p>
      </div>

      {/* Tabla de candidatos actuales */}
      {currentCandidates.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Peso mín.</TableHead>
              <TableHead className="text-right">Peso máx.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCandidates.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-medium">{c.ticker}</TableCell>
                <TableCell className="text-muted-foreground">{c.name ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {c.minWeight ? `${(parseFloat(c.minWeight) * 100).toFixed(1)}%` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {c.maxWeight ? `${(parseFloat(c.maxWeight) * 100).toFixed(1)}%` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground text-sm">
          <TrendingUpIcon className="h-8 w-8" />
          <p>Sin activos candidatos aún. Agrega al menos 2 para optimizar.</p>
        </div>
      )}
    </div>
  );
}
