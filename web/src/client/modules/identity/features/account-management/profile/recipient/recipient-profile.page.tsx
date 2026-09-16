"use client";

import { useRecipientProfile } from "@/client/modules/identity/hooks/use-profile.hooks";
import { RecipientProfileForm } from "./recipient-profile.form";
import { convertRecipientResponseToPayload } from "./recipient-profile.utils";

export function RecipientPage() {
  const { data } = useRecipientProfile();
  const initialData = convertRecipientResponseToPayload(data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Perfil de Beneficiario
        </h1>
        <p className="text-muted-foreground mt-2">
          Administra tu información personal y datos de perfil
        </p>
      </div>

      <RecipientProfileForm initialData={initialData} />
    </div>
  );
}
