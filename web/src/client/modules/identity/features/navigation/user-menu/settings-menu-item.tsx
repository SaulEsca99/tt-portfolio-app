"use client";

import { SETTINGS_ROUTES } from "@/client/config/routes";
import { DropdownMenuItem } from "@client/components/ui/dropdown-menu";
import { Settings } from "lucide-react";

import Link from "next/link";

export function SettingsMenuItem() {
  return (
    <DropdownMenuItem asChild>
      <Link href={SETTINGS_ROUTES.account}>
        <Settings />
        Configuración
      </Link>
    </DropdownMenuItem>
  );
}
