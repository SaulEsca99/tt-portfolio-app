export default function MarketDataPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Datos de mercado</h1>
        <p className="text-sm text-muted-foreground">
          Activos registrados y su historial de precios. El sistema actualiza los precios
          diariamente (Render Cron Job, después del cierre de NY).
        </p>
      </div>
      {/* TODO: tabla de activos + gráfica de precio por ticker */}
      <div className="rounded-lg border p-8 text-center text-muted-foreground text-sm">
        Módulo en construcción — implementar componente de búsqueda de activos (RF-01, RF-02).
      </div>
    </div>
  );
}
