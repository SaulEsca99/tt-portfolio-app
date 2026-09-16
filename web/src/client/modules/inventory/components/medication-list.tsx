"use client";

import { useMedications } from "../hooks/use-medications.hook";

import { MedicationCard } from "./medication-card";
import { MedicationCardSkeleton } from "./medication-card-skeleton";
import { MedicationEmptyState } from "./medication-empty-state";
import { authClient } from "@/app/lib/auth-client";

export function MedicationList() {
  const { data } = useMedications({
    onlyVisible: false,
  });

  const { data: session } = authClient.useSession();

  console.log(data);

  if (!data.medications || data.medications.length === 0) {
    return <MedicationEmptyState isSearch />;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.medications.map((med) => (
        <MedicationCard
          key={med.id}
          medication={med}
          currentUserId={session?.user?.id}
        />
      ))}
    </div>
  );
}

export function MedicationListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <MedicationCardSkeleton key={i} />
      ))}
    </div>
  );
}
