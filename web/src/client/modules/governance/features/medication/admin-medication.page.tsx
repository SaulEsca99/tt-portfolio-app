"use client";

import { Image } from "@/client/components/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { Skeleton } from "@/client/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { AlertCircle, Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAdminMedications,
  useDeleteMedication,
} from "../../hooks/use-admin-medications.hook";

const ITEMS_PER_PAGE = 20;

export function AdminMedicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [controlledFilter, setControlledFilter] = useState<string>("all");
  const [visibleFilter, setVisibleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Parse sortBy
  const { sortField, sortDirection } = useMemo(() => {
    switch (sortBy) {
      case "date-desc":
        return { sortField: "createdAt", sortDirection: "desc" as const };
      case "date-asc":
        return { sortField: "createdAt", sortDirection: "asc" as const };
      case "expiry-asc":
        return { sortField: "expiryDate", sortDirection: "asc" as const };
      case "quantity-desc":
        return { sortField: "quantity", sortDirection: "desc" as const };
      default:
        return { sortField: "createdAt", sortDirection: "desc" as const };
    }
  }, [sortBy]);

  // Query Data
  const { data, isLoading, refetch } = useAdminMedications({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy: sortField,
    sortOrder: sortDirection,
  });

  // Mutations
  const { mutate: deleteMedication } = useDeleteMedication();

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este medicamento?")) {
      deleteMedication(id, {
        onSuccess: () => {
          toast.success("Medicamento eliminado");
          refetch();
        },
        onError: () => {
          toast.error("Error al eliminar");
        },
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      disponible: "bg-green-500 hover:bg-green-600",
      reservado: "bg-yellow-500 hover:bg-yellow-600",
      entregado: "bg-blue-500 hover:bg-blue-600",
      cancelado: "bg-red-500 hover:bg-red-600",
      caducado: "bg-gray-500 hover:bg-gray-600",
    };
    return (
      <Badge className={variants[status] || "bg-gray-500"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isExpiringSoon = (expiryDate: Date) => {
    const daysUntilExpiry = Math.ceil(
      // eslint-disable-next-line react-hooks/purity
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: Date) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Medicamentos</h1>
        <p className="text-muted-foreground">
          Gestiona todos los medicamentos de la plataforma
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra y busca medicamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por sustancia..."
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
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="reservado">Reservado</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={controlledFilter}
              onValueChange={setControlledFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Controlado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Controlado</SelectItem>
                <SelectItem value="no">No controlado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={visibleFilter} onValueChange={setVisibleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Visibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Visible</SelectItem>
                <SelectItem value="no">Oculto</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Más reciente</SelectItem>
                <SelectItem value="date-asc">Más antiguo</SelectItem>
                <SelectItem value="expiry-asc">Próximos a vencer</SelectItem>
                <SelectItem value="quantity-desc">Mayor cantidad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medicamentos ({data?.total || 0})</CardTitle>
          <CardDescription>
            Mostrando {data?.data.length || 0} de {data?.total || 0}{" "}
            medicamentos
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
                    <TableHead>Foto</TableHead>
                    <TableHead>Medicamento</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Donador</TableHead>
                    <TableHead>Caducidad</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Publicado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((medication) => (
                    <TableRow key={medication.id}>
                      <TableCell className="font-medium">
                        #{medication.id}
                      </TableCell>
                      <TableCell>
                        <div className="h-12 w-12 relative rounded-md overflow-hidden bg-muted">
                          {medication.photoUrl && (
                            <Image
                              src={medication.photoUrl || "/placeholder.svg"}
                              alt={medication.activeSubstance}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {medication.activeSubstance}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {medication.brand} - {medication.dosage}
                          </p>
                          {medication.isControlled && (
                            <Badge variant="outline" className="text-xs">
                              Controlado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{medication.quantity}</TableCell>
                      <TableCell>{getStatusBadge(medication.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={medication.donor.image || undefined}
                            />
                            <AvatarFallback>
                              {medication.donor.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {medication.donor.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isExpired(medication.expiryDate) && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          {!isExpired(medication.expiryDate) &&
                            isExpiringSoon(medication.expiryDate) && (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          <span
                            suppressHydrationWarning
                            className={
                              isExpired(medication.expiryDate)
                                ? "text-red-500 font-medium"
                                : isExpiringSoon(medication.expiryDate)
                                ? "text-yellow-600 font-medium"
                                : ""
                            }
                          >
                            {new Date(medication.expiryDate).toLocaleDateString(
                              "es-MX"
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-sm">{medication.location}</p>
                          {medication.postalCode && (
                            <p className="text-xs text-muted-foreground">
                              CP: {medication.postalCode}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm" suppressHydrationWarning>
                        {new Date(medication.createdAt).toLocaleDateString(
                          "es-MX"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(medication.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
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
