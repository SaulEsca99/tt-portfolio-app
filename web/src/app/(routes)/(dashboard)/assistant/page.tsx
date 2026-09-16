export default function AssistantPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Asistente</h1>
        <p className="text-sm text-muted-foreground">
          Chat conversacional sobre tus resultados de optimización (RF-10).
          El modelo LLM está pendiente de decisión de diseño — se retoma en la siguiente fase.
        </p>
      </div>
      {/* TODO: componente de chat (ChatMessage list + input) */}
      <div className="rounded-lg border p-8 text-center text-muted-foreground text-sm">
        Módulo pendiente — la decisión del LLM no se ha tomado todavía.
      </div>
    </div>
  );
}
