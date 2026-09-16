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
import {
  useCancelRequest,
  useMyRequests,
} from "@/client/modules/matchmaking/hooks/use-medication-requests.hook";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Package,
  Phone,
  XCircle,
} from "lucide-react";
import { useState } from "react";

type RequestWithMedication = {
  id: string;
  status: string;
  urgencyLevel: string;
  medicalSituation: string;
  requesterPhone?: string;
  createdAt: Date;
  medication?: {
    brand?: string;
    activeSubstance?: string;
    dosage?: string;
    donor?: {
      name?: string;
    };
  };
};

export default function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data, isLoading } = useMyRequests();
  const cancelRequest = useCancelRequest({});

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-6xl px-4 py-6">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const requests = (data?.data || []) as RequestWithMedication[];

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((r) => r.status === activeTab);

  const statusConfig = {
    pending: {
      label: "Pendiente",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    accepted: {
      label: "Aceptada",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    rejected: {
      label: "Rechazada",
      color: "bg-red-100 text-red-700",
      icon: XCircle,
    },
  };

  const urgencyConfig = {
    critical: {
      label: "Crítica",
      color: "bg-red-100 text-red-700 border-red-200",
    },
    high: {
      label: "Alta",
      color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    medium: {
      label: "Media",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    low: {
      label: "Baja",
      color: "bg-green-100 text-green-700 border-green-200",
    },
  };

  const handleCancelRequest = (requestId: string) => {
    if (confirm("¿Estás seguro de cancelar esta solicitud?")) {
      cancelRequest.mutate(requestId);
    }
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Mis Solicitudes</h1>
          <p className="text-muted-foreground mt-2">
            Revisa el estado de tus solicitudes de medicamentos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todas ({requests.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pendientes (
              {requests.filter((r) => r.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Aceptadas (
              {requests.filter((r) => r.status === "accepted").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {filteredRequests.length === 0 ? (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-lg">
                      No hay solicitudes
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "pending"
                        ? "No tienes solicitudes pendientes"
                        : activeTab === "accepted"
                        ? "Aún no tienes solicitudes aceptadas"
                        : "Busca medicamentos disponibles y solicita el que necesites"}
                    </p>
                  </div>
                  {activeTab === "all" && (
                    <Button className="mt-4 bg-teal-600 hover:bg-teal-700">
                      Buscar Medicamentos
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => {
                  const statusConf =
                    statusConfig[request.status as keyof typeof statusConfig];
                  const urgencyConf =
                    urgencyConfig[
                      request.urgencyLevel as keyof typeof urgencyConfig
                    ];

                  if (!statusConf || !urgencyConf) return null;

                  const StatusIcon = statusConf.icon;

                  return (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-lg">
                                {request.medication?.brand ||
                                  request.medication?.activeSubstance}
                              </CardTitle>
                              <Badge className={statusConf.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConf.label}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={urgencyConf.color}
                              >
                                Urgencia: {urgencyConf.label}
                              </Badge>
                            </div>
                            <CardDescription>
                              Dosis: {request.medication?.dosage}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span>
                              Donante:{" "}
                              <span className="font-medium text-foreground">
                                {request.medication?.donor?.name ||
                                  "Desconocido"}
                              </span>
                            </span>
                          </div>

                          {request.requesterPhone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{request.requesterPhone}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Solicitado{" "}
                              {formatDistanceToNow(
                                new Date(request.createdAt),
                                {
                                  addSuffix: true,
                                  locale: es,
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-medium mb-2">
                            Tu situación médica:
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {request.medicalSituation}
                          </p>
                        </div>

                        {request.status === "accepted" && (
                          <div className="pt-3 border-t bg-green-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                            <p className="text-sm font-medium text-green-900">
                              ✓ Solicitud aceptada
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              Contacta al donante para coordinar la entrega
                            </p>
                          </div>
                        )}

                        {request.status === "pending" && (
                          <div className="pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                              onClick={() => handleCancelRequest(request.id)}
                              disabled={cancelRequest.isPending}
                            >
                              {cancelRequest.isPending
                                ? "Cancelando..."
                                : "Cancelar Solicitud"}
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
      </div>
    </main>
  );
}
