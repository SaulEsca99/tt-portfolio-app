"use client";

import { Button } from "@/client/components/ui/button";
import { Skeleton } from "@/client/components/ui/skeleton";
import { RequestsList } from "@/client/modules/matchmaking/components/requests-list";
import { useRequestsForMedication } from "@/client/modules/matchmaking/hooks/use-medication-requests.hook";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface MedicationRequest {
  id: string;
  requesterName: string;
  requesterPhone: string;
  requesterImage?: string;
  medicalSituation: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  socioeconomicScore?: number;
  trustScore?: "Alta" | "Media" | "Baja";
  requestedAt: Date;
  status: "pending" | "accepted" | "rejected";
  prescriptionUrl?: string;
}

export default function MedicationRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const medicationId = Number(params.id);

  const { data, isLoading } = useRequestsForMedication(medicationId);

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96" />
      </main>
    );
  }

  const requests = (data as MedicationRequest[]) || [];

  return (
    <main className="container mx-auto max-w-4xl px-4 py-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Solicitudes Recibidas</h1>
          <p className="text-muted-foreground mt-2">
            Revisa y gestiona las solicitudes para este medicamento
          </p>
        </div>

        <RequestsList requests={requests} />
      </div>
    </main>
  );
}
