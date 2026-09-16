"use client";

import { auth } from "@/app/lib/auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/client/components/ui/avatar";

import { SETTINGS_ROUTES } from "@/client/config/routes";
import type { Session, User } from "better-auth";
import {
  AlertTriangle,
  Key,
  Laptop,
  Link2,
  Mail,
  ShieldCheck,
  UserIcon,
} from "lucide-react";
import {
  SettingsCard,
  SettingsRowLink,
  SettingsSectionTitle,
} from "../components/settings-layout";

type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

interface AccountPageProps {
  user: User;
  sessions: Session[];
  currentAccounts: Account[];
}

export function GeneralPage({
  user,
  sessions,
  currentAccounts,
}: AccountPageProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-6 pb-2">
        <Avatar className="size-20 ring-4 ring-background shadow-sm">
          <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div>
        <SettingsSectionTitle title="Información Personal" />
        <SettingsCard>
          <SettingsRowLink
            icon={UserIcon}
            label="Nombre y foto"
            value={user.name}
            href={SETTINGS_ROUTES.account}
          />
          <SettingsRowLink
            icon={Mail}
            label="Email"
            value={user.email}
            badge={user.emailVerified ? "Verificado" : "No verificado"}
            badgeVariant={user.emailVerified ? "default" : "destructive"}
            href={SETTINGS_ROUTES.account}
          />
        </SettingsCard>
      </div>

      <div>
        <SettingsSectionTitle title="Seguridad" />
        <SettingsCard>
          <SettingsRowLink
            icon={Key}
            label="Contraseña"
            value="Cambiar contraseña"
            href={SETTINGS_ROUTES.security}
          />
          <SettingsRowLink
            icon={ShieldCheck}
            label="Autenticación en dos pasos"
            value="Gestionar 2FA"
            badge="Desactivada"
            badgeVariant="destructive"
            href={SETTINGS_ROUTES.security}
          />
        </SettingsCard>
      </div>

      <div>
        <SettingsSectionTitle title="Cuenta" />
        <SettingsCard>
          <SettingsRowLink
            icon={Link2}
            label="Cuentas conectadas"
            value={`${currentAccounts.length} conectadas`}
            href={SETTINGS_ROUTES.account}
          />
          <SettingsRowLink
            icon={Laptop}
            label="Sesiones activas"
            value={`${sessions.length} dispositivos`}
            href={SETTINGS_ROUTES.account}
          />
          <SettingsRowLink
            icon={AlertTriangle}
            label="Zona de peligro"
            value="Eliminar cuenta y datos"
            href={SETTINGS_ROUTES.account}
            destructive
          />
        </SettingsCard>
      </div>
    </div>
  );
}
