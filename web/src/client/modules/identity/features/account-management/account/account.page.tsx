"use client";

import { authClient } from "@/app/lib/auth-client";
import { Badge } from "@/client/components/ui/badge";
import { Session } from "better-auth";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  SettingsCard,
  SettingsSectionTitle,
} from "../components/settings-layout";
import { formatSessions, FormattedSession } from "./account.utils";

interface AccountPageProps {
  sessions: Session[];
  currentSessionToken: string;
}

export function AccountPage({
  sessions,
  currentSessionToken,
}: AccountPageProps) {
  const router = useRouter();
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  const activeSessions = formatSessions(sessions, currentSessionToken);

  const handleRevokeAll = async () => {
    setIsRevokingAll(true);
    await authClient.revokeOtherSessions(undefined, {
      onSuccess: () => {
        toast.success("Se han cerrado las otras sesiones");
        router.refresh();
      },
      onError: () => {
        toast.error("Error al cerrar sesiones");
      },
    });
    setIsRevokingAll(false);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Cuenta</h2>
        <p className="text-muted-foreground mt-1">
          Administra tu cuenta y sesiones activas
        </p>
      </div>

      <div className="space-y-3">
        <SettingsSectionTitle title="Cuentas vinculadas" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <SettingsSectionTitle title="Sesiones Activas" />
          {activeSessions.length > 1 && (
            <button
              onClick={handleRevokeAll}
              disabled={isRevokingAll}
              className="text-sm text-destructive hover:bg-destructive/10 px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isRevokingAll && <Loader2 className="size-3 animate-spin" />}
              Cerrar todas las demás
            </button>
          )}
        </div>

        <SettingsCard>
          {activeSessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </SettingsCard>
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: FormattedSession }) {
  const router = useRouter();
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    setIsRevoking(true);

    try {
      await authClient.revokeSession({
        token: session.token,
      });

      toast.success("Sesión cerrada");
      router.refresh();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.error("Error al cerrar sesión");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 group">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
        <session.icon className="size-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-foreground">
            {session.device}
          </p>
          {session.isCurrent && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
            >
              Actual
            </Badge>
          )}
        </div>
        <div className="flex items-center text-xs text-muted-foreground gap-1 mt-0.5">
          <span>{session.location}</span>
          <span>•</span>
          <span
            className={session.isCurrent ? "text-green-600 font-medium" : ""}
          >
            {session.isCurrent ? "Activo ahora" : session.lastActive}
          </span>
        </div>
      </div>

      {!session.isCurrent && (
        <button
          onClick={handleRevoke}
          disabled={isRevoking}
          title="Cerrar sesión"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
        >
          {isRevoking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
