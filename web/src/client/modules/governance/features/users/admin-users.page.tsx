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
import { Ban, CheckCircle, Eye, Search, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";

import { Skeleton } from "@/client/components/ui/skeleton";
import { toast } from "sonner";
import {
  useAdminUsers,
  useBanUser,
  useUnbanUser,
} from "../../hooks/use-admin-users.hook";

const ITEMS_PER_PAGE = 20;

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Parse sortBy
  const { sortField, sortDirection } = useMemo(() => {
    switch (sortBy) {
      case "date-desc":
        return { sortField: "createdAt", sortDirection: "desc" as const };
      case "date-asc":
        return { sortField: "createdAt", sortDirection: "asc" as const };
      case "name":
        return { sortField: "name", sortDirection: "asc" as const };
      default:
        return { sortField: "createdAt", sortDirection: "desc" as const };
    }
  }, [sortBy]);

  // Query Data
  const { data, isLoading, refetch } = useAdminUsers({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    search: searchTerm,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    sortBy: sortField,
    sortOrder: sortDirection,
  });

  // Mutations
  const { mutate: banUser } = useBanUser();
  const { mutate: unbanUser } = useUnbanUser();

  const handleBan = (userId: string) => {
    const reason = prompt("Ingrese la razón para banear al usuario:");
    if (reason) {
      banUser(
        { userId, reason },
        {
          onSuccess: () => {
            toast.success("Usuario baneado correctamente");
            refetch();
          },
          onError: () => {
            toast.error("Error al banear usuario");
          },
        }
      );
    }
  };

  const handleUnban = (userId: string) => {
    if (confirm("¿Estás seguro de desbanear a este usuario?")) {
      unbanUser(userId, {
        onSuccess: () => {
          toast.success("Usuario desbaneado correctamente");
          refetch();
        },
        onError: () => {
          toast.error("Error al desbanear usuario");
        },
      });
    }
  };

  const getUserType = (user: { isDonor: boolean; isBeneficiary: boolean }) => {
    if (user.isDonor && user.isBeneficiary) return "Ambos";
    if (user.isDonor) return "Donador";
    if (user.isBeneficiary) return "Receptor";
    return "Usuario";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona todos los usuarios de la plataforma
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra y busca usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="donor">Donador</SelectItem>
                <SelectItem value="recipient">Receptor</SelectItem>
                <SelectItem value="both">Ambos</SelectItem>
              </SelectContent>
            </Select>

            {/* Verification filter skipped or simplified as data not available yet */}

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="banned">Baneado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Más reciente</SelectItem>
                <SelectItem value="date-asc">Más antiguo</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({data?.total || 0})</CardTitle>
          <CardDescription>
            Mostrando {data?.data.length || 0} de {data?.total || 0} usuarios
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
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Tipo</TableHead>
                    {/* <TableHead>Verificación</TableHead> */}
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback>
                              {user.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {user.isDonor && (
                            <span title="Donador">
                              <UserCheck className="h-4 w-4 text-green-500" />
                            </span>
                          )}
                          {user.isBeneficiary && (
                            <span title="Receptor">
                              <UserX className="h-4 w-4 text-blue-500" />
                            </span>
                          )}
                          <span className="text-sm">{getUserType(user)}</span>
                        </div>
                      </TableCell>
                      {/* <TableCell>Verification Status Here</TableCell> */}
                      <TableCell className="text-sm" suppressHydrationWarning>
                        {new Date(user.createdAt).toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell>
                        {user.banned ? (
                          <Badge className="bg-red-500 hover:bg-red-600">
                            Baneado
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Activo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={
                              user.banned
                                ? "text-green-600 hover:text-green-700"
                                : "text-red-600 hover:text-red-700"
                            }
                            onClick={() =>
                              user.banned
                                ? handleUnban(user.id)
                                : handleBan(user.id)
                            }
                          >
                            {user.banned ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
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
