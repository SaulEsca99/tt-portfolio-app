"use client";

import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Skeleton } from "@/client/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import { useMyMedications } from "@/client/modules/inventory/hooks/use-my-medications.hook";
import { RequestsList } from "@/client/modules/matchmaking/components/requests-list";
import { useRequestsForMedication } from "@/client/modules/matchmaking/hooks/use-medication-requests.hook";
import { CheckCircle, Clock, Eye, Package, XCircle } from "lucide-react";
import { useState } from "react";

export default function MyDonationsPage() {
  const [selectedDonation, setSelectedDonation] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data, isLoading } = useMyMedications();

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-6xl px-4 py-6">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const medications = data?.medications || [];

  const filteredMedications =
    activeTab === "all"
      ? medications
      : medications.filter((d) => d.status === activeTab);

  const statusConfig = {
    disponible: {
      label: "Activa",
      color: "bg-teal-100 text-teal-700",
      icon: Clock,
    },
    reservado: {
      label: "Reservada",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    entregado: {
      label: "Completada",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    cancelado: {
      label: "Cancelada",
      color: "bg-gray-100 text-gray-700",
      icon: XCircle,
    },
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Mis Donaciones</h1>
          <p className="text-muted-foreground mt-2">
            Administra tus medicamentos donados y revisa las solicitudes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todas ({medications.length})</TabsTrigger>
            <TabsTrigger value="disponible">
              Activas (
              {medications.filter((d) => d.status === "disponible").length})
            </TabsTrigger>
            <TabsTrigger value="entregado">
              Completadas (
              {medications.filter((d) => d.status === "entregado").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {filteredMedications.length === 0 ? (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <Package className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-lg">No hay donaciones</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "disponible"
                        ? "No tienes donaciones activas en este momento"
                        : activeTab === "entregado"
                        ? "Aún no has completado ninguna donación"
                        : "Crea tu primera donación para comenzar"}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredMedications.map((donation) => {
                  const config =
                    statusConfig[donation.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;

                  return (
                    <Card
                      key={donation.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {donation.brand || donation.activeSubstance}
                            </CardTitle>
                            <CardDescription>
                              {donation.dosage} • {donation.quantity}{" "}
                              {donation.presentation || "unidades"}
                            </CardDescription>
                          </div>
                          <Badge className={config.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {donation.isControlled && (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            Medicamento Controlado
                          </Badge>
                        )}

                        <div className="text-sm text-muted-foreground">
                          Publicada hace{" "}
                          {Math.floor(
                            (new Date().getTime() -
                              new Date(donation.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          días
                        </div>

                        {donation.status === "disponible" && (
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm font-medium">
                              {donation.requestsCount} solicitud
                              {donation.requestsCount !== 1 && "es"}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 bg-transparent"
                              onClick={() => setSelectedDonation(donation.id)}
                            >
                              <Eye className="h-4 w-4" />
                              Ver Solicitudes
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedDonation && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Solicitudes para{" "}
                  {medications.find((m) => m.id === selectedDonation)?.brand ||
                    medications.find((m) => m.id === selectedDonation)
                      ?.activeSubstance}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDonation(null)}
                >
                  Cerrar
                </Button>
              </div>
              <RequestsListWrapper medicationId={selectedDonation} />
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

function RequestsListWrapper({ medicationId }: { medicationId: number }) {
  const { data, isLoading } = useRequestsForMedication(medicationId);

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  const requests = data || [];

  return <RequestsList requests={requests} />;
}
