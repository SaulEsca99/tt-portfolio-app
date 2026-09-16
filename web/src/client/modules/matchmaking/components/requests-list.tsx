"use client";

import { Alert, AlertDescription } from "@/client/components/ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/client/components/ui/avatar";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Card } from "@/client/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/client/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog";
import { Progress } from "@/client/components/ui/progress";
import { Separator } from "@/client/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Inbox,
  Phone,
} from "lucide-react";
import { useState } from "react";
import {
  useAcceptRequest,
  useRejectRequest,
} from "../hooks/use-medication-requests.hook";

export interface MedicationRequest {
  id: string;
  requesterName: string;
  requesterPhone: string;
  requesterImage?: string;
  medicalSituation: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  socioeconomicScore?: number | null;
  trustScore?: "Alta" | "Media" | "Baja";
  requestedAt: Date;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "expired";
  prescriptionUrl?: string;
}

interface RequestsListProps {
  requests: MedicationRequest[];
}

export function RequestsList({ requests }: RequestsListProps) {
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(
    new Set()
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "accept" | "reject" | null;
    requestId: string | null;
    requesterName: string;
  }>({
    open: false,
    type: null,
    requestId: null,
    requesterName: "",
  });

  const acceptRequest = useAcceptRequest({
    onSuccess: () => {
      setConfirmDialog({
        open: false,
        type: null,
        requestId: null,
        requesterName: "",
      });
    },
  });

  const rejectRequest = useRejectRequest({
    onSuccess: () => {
      setConfirmDialog({
        open: false,
        type: null,
        requestId: null,
        requesterName: "",
      });
    },
  });

  const isLoading = acceptRequest.isPending || rejectRequest.isPending;

  const pendingRequests = requests.filter((req) => req.status === "pending");

  const rankedRequests = [...pendingRequests].sort((a, b) => {
    // First by urgency
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    if (urgencyOrder[a.urgencyLevel] !== urgencyOrder[b.urgencyLevel]) {
      return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
    }
    // Then by socioeconomic score
    return (b.socioeconomicScore || 0) - (a.socioeconomicScore || 0);
  });

  const toggleExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const handleAcceptClick = (request: MedicationRequest) => {
    setConfirmDialog({
      open: true,
      type: "accept",
      requestId: request.id,
      requesterName: request.requesterName,
    });
  };

  const handleRejectClick = (request: MedicationRequest) => {
    setConfirmDialog({
      open: true,
      type: "reject",
      requestId: request.id,
      requesterName: request.requesterName,
    });
  };

  const handleConfirm = () => {
    if (!confirmDialog.requestId || !confirmDialog.type) return;

    if (confirmDialog.type === "accept") {
      acceptRequest.mutate(confirmDialog.requestId);
    } else {
      rejectRequest.mutate(confirmDialog.requestId);
    }
  };

  const getUrgencyBadge = (level: MedicationRequest["urgencyLevel"]) => {
    const styles = {
      critical: "bg-red-100 text-red-700 border-red-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-green-100 text-green-700 border-green-200",
    };
    const labels = {
      critical: "Crítica",
      high: "Alta",
      medium: "Media",
      low: "Baja",
    };
    return { style: styles[level], label: labels[level] };
  };

  const getTrustScoreColor = (score?: string) => {
    switch (score) {
      case "Alta":
        return "bg-green-100 text-green-700 border-green-200";
      case "Media":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Baja":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRankingBorder = (index: number) => {
    if (index === 0) return "border-l-4 border-yellow-400"; // Gold
    if (index === 1) return "border-l-4 border-gray-400"; // Silver
    if (index === 2) return "border-l-4 border-orange-400"; // Bronze
    return "border-l-4 border-transparent";
  };

  if (rankedRequests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">
          No hay solicitudes aún
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Cuando alguien solicite este medicamento, aparecerá aquí
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Solicitudes recibidas</h3>
          <Badge variant="secondary" className="bg-teal-100 text-teal-700">
            {rankedRequests.length} pendientes
          </Badge>
        </div>

        <div className="space-y-3">
          {rankedRequests.map((request, index) => {
            const urgency = getUrgencyBadge(request.urgencyLevel);
            const isExpanded = expandedRequests.has(request.id);

            return (
              <Card
                key={request.id}
                className={`p-4 ${getRankingBorder(index)}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm font-bold">
                        #{index + 1}
                      </Badge>
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage
                          src={request.requesterImage || "/placeholder.svg"}
                          alt={request.requesterName}
                        />
                        <AvatarFallback>
                          {request.requesterName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">
                          {request.requesterName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={urgency.style}>
                            {urgency.label}
                          </Badge>
                          {request.trustScore && (
                            <Badge
                              variant="outline"
                              className={getTrustScoreColor(request.trustScore)}
                            >
                              <Award className="w-3 h-3 mr-1" />
                              {request.trustScore}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{request.requesterPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Solicitado{" "}
                        {formatDistanceToNow(new Date(request.requestedAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>

                    {request.socioeconomicScore !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Necesidad socioeconómica
                          </span>
                          <span className="font-medium">
                            {request.socioeconomicScore}/100
                          </span>
                        </div>
                        <Progress
                          value={request.socioeconomicScore}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>

                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(request.id)}
                  >
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <p className={isExpanded ? "" : "line-clamp-2"}>
                          {request.medicalSituation}
                        </p>
                      </div>
                      {request.medicalSituation.length > 100 && (
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-teal-600 hover:text-teal-700"
                          >
                            {isExpanded ? (
                              <>
                                Ver menos <ChevronUp className="w-4 h-4 ml-1" />
                              </>
                            ) : (
                              <>
                                Ver más <ChevronDown className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                  </Collapsible>

                  {request.prescriptionUrl && (
                    <a
                      href={request.prescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Ver receta médica
                    </a>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptClick(request)}
                      disabled={isLoading}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                    >
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectClick(request)}
                      disabled={isLoading}
                      className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !isLoading && setConfirmDialog({ ...confirmDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "accept"
                ? "¿Confirmar donación?"
                : "¿Rechazar solicitud?"}
            </DialogTitle>
            <DialogDescription className="text-pretty">
              {confirmDialog.type === "accept"
                ? `¿Estás seguro de donar a ${confirmDialog.requesterName}?`
                : `¿Estás seguro de rechazar la solicitud de ${confirmDialog.requesterName}?`}
            </DialogDescription>
          </DialogHeader>

          {confirmDialog.type === "accept" && (
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800">
                Esto rechazará automáticamente las otras solicitudes pendientes
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() =>
                setConfirmDialog({
                  open: false,
                  type: null,
                  requestId: null,
                  requesterName: "",
                })
              }
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              variant={
                confirmDialog.type === "reject" ? "destructive" : "default"
              }
              className={
                confirmDialog.type === "accept"
                  ? "bg-teal-600 hover:bg-teal-700"
                  : ""
              }
            >
              {isLoading
                ? "Procesando..."
                : confirmDialog.type === "accept"
                ? "Confirmar Donación"
                : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
