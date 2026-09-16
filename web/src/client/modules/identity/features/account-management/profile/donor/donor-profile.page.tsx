"use client";

import { useDonorProfile } from "@/client/modules/identity/hooks/use-profile.hooks";

import { DonorProfileForm } from "./donor-profile.form";
import { convertDonorResponseToPayload } from "./donor-profile.utils";

export function DonorPage() {
  const { data } = useDonorProfile();

  const initialData = convertDonorResponseToPayload(data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Perfil de Donador
        </h1>
        <p className="text-muted-foreground mt-2">
          Administra tu información personal y datos de perfil
        </p>
      </div>

      <DonorProfileForm initialData={initialData} />
    </div>
  );
}
