"use client";

import { useState } from "react";
import { useOptimizationPanel } from "@/client/modules/optimization/features/run-optimization/use-optimization-panel.hook";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { Badge } from "@/client/components/ui/badge";
import { Separator } from "@/client/components/ui/separator";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Algorithm } from "@/client/types/domain.types";

interface Props {
  portfolioId: string;
  portfolioName: string;
}

export function OptimizationPanel({ portfolioId, portfolioName }: Props) {
  const {
    selectedAlgorithm,
    setSelectedAlgorithm,
    optimizationResult,
    backtestResult,
    isOptimizing,
    isBacktesting,
    handleOptimize,
    handleBacktest,
  } = useOptimizationPanel(portfolioId);

  return (
    <div className="space-y-6">
      {/* Selector de algoritmo */}
      <Card>
        <CardHeader>
          <CardTitle>Optimización — {portfolioName}</CardTitle>
          <CardDescription>
            Selecciona el algoritmo bioinspirado y ejecuta la optimización. El servicio puede
            tardar ~30 s en responder si lleva tiempo inactivo (cold start de Render).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select
              value={selectedAlgorithm}
              onValueChange={(v) => setSelectedAlgorithm(v as Algorithm)}
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ga">Algoritmo Genético (GA)</SelectItem>
                <SelectItem value="pso">Enjambre de Partículas (PSO)</SelectItem>
                <SelectItem value="de">Evolución Diferencial (DE)</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleOptimize} disabled={isOptimizing} className="w-40">
              {isOptimizing ? "Optimizando…" : "Optimizar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de optimización */}
      {optimizationResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pesos óptimos</CardTitle>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  Retorno esperado: {(optimizationResult.expectedReturn * 100).toFixed(2)}%
                </Badge>
                <Badge variant="outline">
                  Riesgo: {(optimizationResult.expectedRisk * 100).toFixed(2)}%
                </Badge>
                <Badge variant="outline">
                  Sharpe: {optimizationResult.sharpeRatio.toFixed(3)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={optimizationResult.weights.map((w) => ({
                  ticker: w.ticker,
                  peso: parseFloat((w.weight * 100).toFixed(2)),
                }))}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ticker" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="peso" name="Peso (%)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <Separator className="my-4" />
            <Button
              onClick={() => handleBacktest()}
              disabled={isBacktesting}
              variant="outline"
              className="w-full"
            >
              {isBacktesting ? "Ejecutando backtesting…" : "Evaluar con Walk-Forward Analysis"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resultados de backtesting */}
      {backtestResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Backtesting — Walk-Forward</CardTitle>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">Sharpe: {backtestResult.sharpe.toFixed(3)}</Badge>
                <Badge variant="secondary">Sortino: {backtestResult.sortino.toFixed(3)}</Badge>
                <Badge variant="secondary">
                  Max DD: {(backtestResult.maxDrawdown * 100).toFixed(2)}%
                </Badge>
                <Badge variant="secondary">
                  Retorno acum.: {(backtestResult.cumulativeReturn * 100).toFixed(2)}%
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={backtestResult.equityCurve.map((p) => ({
                  fecha: p.date,
                  valor: parseFloat(p.portfolioValue.toFixed(2)),
                }))}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  name="Valor del portafolio"
                  stroke="hsl(var(--primary))"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
