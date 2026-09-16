"use client";

import { Button } from "@/client/components/ui/button";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  children: React.ReactNode;
}

export function QueryErrorBoundary({ children }: Props) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Algo salió mal al cargar los datos
          </h3>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            No pudimos conectar con el servidor. Por favor, intenta de nuevo.
          </p>
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            className="gap-2 border-destructive/20 hover:bg-destructive/10"
          >
            <RefreshCcw className="size-4" />
            Reintentar
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
