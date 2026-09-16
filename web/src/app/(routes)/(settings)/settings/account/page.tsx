import { guardAuth } from "@/app/lib/auth-guard";
import { Button } from "@/client/components/ui/button";
import { ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";

export default async function Account() {
  await guardAuth();

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="rounded-full bg-muted p-6 mb-6">
        <UserCog className="h-12 w-12 text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">
        Configuración de la Cuenta
      </h2>

      <p className="text-muted-foreground max-w-md mb-8 text-balance">
        Estamos preparando las herramientas para que puedas administrar tus
        datos personales, gestionar cuentas vinculadas y controlar la privacidad
        de tu perfil.
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
