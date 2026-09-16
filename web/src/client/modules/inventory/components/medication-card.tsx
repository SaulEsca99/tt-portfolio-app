"use client";

import { Image } from "@/client/components/image";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent } from "@/client/components/ui/card";
import { UserAvatar } from "@/client/modules/identity/components/user-avatar";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, MapPin, Package, Eye } from "lucide-react";

import { Medication } from "@/client/types/medication.types";
import { MedicationInteractions } from "./medication-interactions";
import { useRouter } from "next/navigation";
import { useRequestMedicationModal } from "@/client/modules/matchmaking/hooks/use-request-medication-modal";

interface MedicationCardProps {
  medication: Medication;
  currentUserId?: string;
}

export function MedicationCard({ medication, currentUserId }: MedicationCardProps) {
  const router = useRouter();
  const requestModal = useRequestMedicationModal();

  const formatExpiryDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("es-MX", {
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/50";
      case "reservado":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200/50";
      case "entregado":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50";
      case "cancelado":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Check if this medication belongs to the current user
  const isOwnMedication = currentUserId && medication.donorId === currentUserId;

  const handleButtonClick = () => {
    if (isOwnMedication) {
      // Navigate to requests page for this medication
      router.push(`/medication/${medication.id}/requests`);
    } else {
      // Open request modal
      requestModal.onOpen({
        medicationId: medication.id,
        medicationName: medication.brand || medication.activeSubstance,
        medicationDosage: medication.dosage,
        isControlled: medication.isControlled,
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-4 pb-3">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={medication.donor.name}
              image={medication.donor.image}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {medication.donor.name || "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(medication.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          </div>
          <Badge
            className={getStatusColor(medication.status)}
            variant="outline"
          >
            {medication.status}
          </Badge>
        </div>

        {medication.photoUrl && (
          <div className="relative h-[300px] w-full bg-muted">
            <Image
              src={medication.photoUrl}
              alt={medication.brand || medication.activeSubstance}
              className="object-cover"
              fill
            />
            {medication.isControlled && (
              <div className="absolute right-3 top-3 z-10">
                <Badge className="bg-red-500 text-white shadow-sm">
                  Controlado
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="border-y border-border px-2 py-2">
          <MedicationInteractions medicationId={medication.id} />
        </div>

        <div className="space-y-4 px-4 py-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {medication.brand || medication.activeSubstance}
            </h3>
            <p className="text-sm text-muted-foreground capitalize">
              {medication.activeSubstance} • {medication.dosage}
            </p>
          </div>

          <div className="grid gap-3">
            <div className="flex items-start gap-2">
              <Package className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  {medication.quantity} {medication.presentation || "unidades"}
                </p>
                {medication.laboratory && (
                  <p className="text-xs text-muted-foreground">
                    Lab: {medication.laboratory}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm text-foreground">
                Caduca: {formatExpiryDate(medication.expiryDate)}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{medication.location}</p>
                {medication.postalCode && (
                  <p className="text-xs text-muted-foreground">
                    CP: {medication.postalCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {medication.description && (
            <p className="text-sm leading-relaxed text-foreground/90 text-pretty">
              {medication.description}
            </p>
          )}

          {medication.preferredSchedule && (
            <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Horario de entrega
                </p>
                <p className="text-sm text-foreground">
                  {medication.preferredSchedule}
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full font-medium"
            size="lg"
            onClick={handleButtonClick}
            variant={isOwnMedication ? "outline" : "default"}
          >
            {isOwnMedication ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Ver solicitudes
              </>
            ) : (
              "Solicitar medicamento"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
