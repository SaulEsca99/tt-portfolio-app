"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/client/components/ui/avatar";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Progress } from "@/client/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { Check, Eye, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Skeleton } from "@/client/components/ui/skeleton";
import { toast } from "sonner";
import {
  useAdminRequests,
  useUpdateRequestStatus,
} from "../../hooks/use-admin-requests.hook";

const ITEMS_PER_PAGE = 20;

export function AdminRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Parse sortBy
  const { sortField, sortDirection } = useMemo(() => {
    switch (sortBy) {
      case "date-desc":
        return { sortField: "requestedAt", sortDirection: "desc" as const };
      case "date-asc":
        return { sortField: "requestedAt", sortDirection: "asc" as const };
      case "urgency":
        return { sortField: "urgencyLevel", sortDirection: "desc" as const };
      case "score-desc":
        return { sortField: "score", sortDirection: "desc" as const };
      default:
        return { sortField: "requestedAt", sortDirection: "desc" as const };
    }
  }, [sortBy]);

  // Query Data
  const { data, isLoading, refetch } = useAdminRequests({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : undefined,
    urgencyLevel: urgencyFilter !== "all" ? urgencyFilter : undefined,
    sortBy: sortField,
    sortOrder: sortDirection,
  });

  // Mutations
  const { mutate: updateStatus } = useUpdateRequestStatus();

  const handleStatusUpdate = (
    id: string,
    newStatus: "accepted" | "rejected"
  ) => {
    const action = newStatus === "accepted" ? "aceptar" : "rechazar";
    if (confirm(`¿Estás seguro de ${action} esta solicitud?`)) {
      updateStatus(
        { requestId: id, status: newStatus },
        {
          onSuccess: () => {
            toast.success(
              `Solicitud ${newStatus === "accepted" ? "aceptada" : "rechazada"}`
            );
            refetch();
          },
          onError: () => {
            toast.error("Error al actualizar la solicitud");
          },
        }
      );
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants: Record<string, string> = {
      critical: "bg-red-500 hover:bg-red-600",
      high: "bg-orange-500 hover:bg-orange-600",
      medium: "bg-yellow-500 hover:bg-yellow-600",
      low: "bg-green-500 hover:bg-green-600",
    };
    const labels: Record<string, string> = {
      critical: "Crítico",
      high: "Alto",
      medium: "Medio",
      low: "Bajo",
    };
    return (
      <Badge className={variants[urgency] || "bg-gray-500"}>
        {labels[urgency] || urgency}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-500 hover:bg-yellow-600",
      accepted: "bg-green-500 hover:bg-green-600",
      rejected: "bg-red-500 hover:bg-red-600",
      cancelled: "bg-gray-500 hover:bg-gray-600",
      expired: "bg-gray-400 hover:bg-gray-500",
    };
    const labels: Record<string, string> = {
      pending: "Pendiente",
      accepted: "Aceptado",
      rejected: "Rechazado",
      cancelled: "Cancelado",
      expired: "Expirado",
    };
    return (
      <Badge className={variants[status] || "bg-gray-500"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const requests = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Solicitudes</h1>
        <p className="text-muted-foreground">
          Gestiona todas las solicitudes de medicamentos
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra y busca solicitudes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por solicitante o medicamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="accepted">Aceptado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Urgencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las urgencias</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="low">Bajo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Más reciente</SelectItem>
                <SelectItem value="date-asc">Más antiguo</SelectItem>
                <SelectItem value="urgency">Por urgencia</SelectItem>
                <SelectItem value="score-desc">Mayor score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes ({data?.total || 0})</CardTitle>
          <CardDescription>
            Mostrando {requests.length} de {data?.total || 0} solicitudes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Medicamento</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Urgencia</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Situación Médica</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        #{request.id.slice(0, 6)}...
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm">
                            {request.medication?.activeSubstance ||
                              "Desconocido"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.medication?.brand} -{" "}
                            {request.medication?.dosage}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={request.requester?.image || undefined}
                            />
                            <AvatarFallback>
                              {request.requesterName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {request.requesterName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {request.requesterPhone}
                      </TableCell>
                      <TableCell>
                        {getUrgencyBadge(request.urgencyLevel)}
                      </TableCell>
                      <TableCell>
                        {request.socioeconomicScore !== null ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {request.socioeconomicScore}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                /100
                              </span>
                            </div>
                            <Progress
                              value={request.socioeconomicScore}
                              className="h-1.5"
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <p
                          className="text-sm truncate"
                          title={request.medicalSituation}
                        >
                          {request.medicalSituation}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-0.5">
                          <p suppressHydrationWarning>
                            {new Date(request.requestedAt).toLocaleDateString(
                              "es-MX"
                            )}
                          </p>
                          {request.respondedAt && (
                            <p
                              className="text-xs text-muted-foreground"
                              suppressHydrationWarning
                            >
                              Resp:{" "}
                              {new Date(request.respondedAt).toLocaleDateString(
                                "es-MX"
                              )}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700"
                                onClick={() =>
                                  handleStatusUpdate(request.id, "accepted")
                                }
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  handleStatusUpdate(request.id, "rejected")
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {data.pageCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {(() => {
                    let start = Math.max(1, currentPage - 2);
                    const end = Math.min(data.pageCount, start + 4);
                    if (end - start < 4) start = Math.max(1, end - 4);

                    const pages = [];
                    for (let p = start; p <= end; p++) pages.push(p);

                    return pages.map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ));
                  })()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(data.pageCount, p + 1))
                  }
                  disabled={currentPage === data.pageCount}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
