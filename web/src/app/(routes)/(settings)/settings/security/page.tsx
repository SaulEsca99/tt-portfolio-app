import { guardAuth } from "@/app/lib/auth-guard";
import { Button } from "@/client/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function Security() {
  await guardAuth();

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="rounded-full bg-muted p-6 mb-6">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">
        Seguridad y Privacidad
      </h2>

      <p className="text-muted-foreground max-w-md mb-8 text-balance">
        Estamos construyendo un panel robusto para que gestiones tu contraseña y
        la autenticación de dos factores. Esta funcionalidad estará disponible
        muy pronto.
      </p>

      <Button asChild variant="outline">
        <Link href="/settings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Configuración
        </Link>
      </Button>
    </main>
  );
}
