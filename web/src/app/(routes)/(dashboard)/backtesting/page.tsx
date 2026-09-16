export default function BacktestingPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Backtesting</h1>
        <p className="text-sm text-muted-foreground">
          El Walk-Forward Analysis se ejecuta desde el panel de optimización de cada portafolio.
          Aquí se mostrarán los resultados históricos comparados entre portafolios (RF-07, RF-08).
        </p>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground text-sm">
        Módulo en construcción — implementar tabla comparativa de backtests.
      </div>
    </div>
  );
}
