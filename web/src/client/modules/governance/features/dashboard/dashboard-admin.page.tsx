/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Skeleton } from "@/client/components/ui/skeleton";
import {
  Activity,
  AlertCircle,
  FileText,
  Package,
  Pill,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "../../components/stat-card";
import { useAdminStats } from "../../hooks/use-admin-stats.hook";

export function AdminDashboard() {
  const { data, isLoading } = useAdminStats();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Helper to safety get count
  const getCount = (arr: any[], key: string, val: string) =>
    arr?.find((item) => item[key] === val)?.count || 0;

  // Medications by status
  const medicationsByStatus = {
    disponible: getCount(data.medications.byStatus, "status", "disponible"),
    reservado: getCount(data.medications.byStatus, "status", "reservado"),
    entregado: getCount(data.medications.byStatus, "status", "entregado"),
    cancelado: getCount(data.medications.byStatus, "status", "cancelado"),
  };

  // Requests by status
  const requestsByStatus = {
    pending: getCount(data.requests.byStatus, "status", "pending"),
    accepted: getCount(data.requests.byStatus, "status", "accepted"),
    rejected: getCount(data.requests.byStatus, "status", "rejected"),
    cancelled: getCount(data.requests.byStatus, "status", "cancelled"),
    expired: getCount(data.requests.byStatus, "status", "expired"),
  };

  // Success rate
  const successRate =
    data.requests.total > 0
      ? Math.round(
          (Number(requestsByStatus.accepted) / data.requests.total) * 100
        )
      : 0;

  // Top active substances
  const topSubstances = data.topSubstances.map((s) => ({
    name: s.substance,
    count: s.count,
  }));

  // Urgency Levels
  const urgencyStats = data.requests.byUrgency || [];
  const urgencyData = [
    {
      name: "Crítica",
      value: getCount(urgencyStats, "urgency", "critical"),
      color: "#ef4444",
    },
    {
      name: "Alta",
      value: getCount(urgencyStats, "urgency", "high"),
      color: "#f59e0b",
    },
    {
      name: "Media",
      value: getCount(urgencyStats, "urgency", "medium"),
      color: "#eab308",
    },
    {
      name: "Baja",
      value: getCount(urgencyStats, "urgency", "low"),
      color: "#22c55e",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Vista general de la plataforma DONAMED
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Medicamentos"
          value={data.medications.total}
          change={12}
          changeLabel="vs mes anterior"
          icon={Pill}
          description={`${medicationsByStatus.disponible} disponibles`}
        />
        <StatCard
          title="Total Solicitudes"
          value={data.requests.total}
          change={8}
          changeLabel="vs mes anterior"
          icon={FileText}
          description={`${requestsByStatus.pending} pendientes`}
        />
        <StatCard
          title="Total Usuarios"
          value={data.users.total}
          change={15}
          changeLabel="vs mes anterior"
          icon={Users}
          description={`${data.users.donors} donadores, ${data.users.recipients} receptores`}
        />
        <StatCard
          title="Tasa de Éxito"
          value={`${successRate}%`}
          change={5}
          changeLabel="vs mes anterior"
          icon={TrendingUp}
          description="Solicitudes aceptadas"
        />
      </div>

      {/* Top Substances and Urgency Levels */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Substances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Sustancias Más Solicitadas
            </CardTitle>
            <CardDescription>Top 10 medicamentos por demanda</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={topSubstances}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
              >
                <XAxis
                  type="number"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Solicitudes por Urgencia
            </CardTitle>
            <CardDescription>
              Distribución de niveles de prioridad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={urgencyData} margin={{ left: 10, right: 10 }}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estados de Medicamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Disponible</span>
              </div>
              <span className="text-green-500">
                {medicationsByStatus.disponible}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium">Reservado</span>
              </div>
              <span className="text-yellow-500">
                {medicationsByStatus.reservado}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Entregado</span>
              </div>
              <span className="text-blue-500">
                {medicationsByStatus.entregado}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium">Cancelado</span>
              </div>
              <span className="text-red-500">
                {medicationsByStatus.cancelado}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estados de Solicitudes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500" />
                <span className="text-sm font-medium">Pendiente</span>
              </div>
              <span>{requestsByStatus.pending}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Aceptado</span>
              </div>
              <span className="text-green-500">
                {requestsByStatus.accepted}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium">Rechazado</span>
              </div>
              <span className="text-red-500">{requestsByStatus.rejected}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400" />
                <span className="text-sm font-medium">Cancelado</span>
              </div>
              <span>{requestsByStatus.cancelled}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400" />
                <span className="text-sm font-medium">Expirado</span>
              </div>
              <span>{requestsByStatus.expired}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>Últimas acciones en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Pill className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nueva donación registrada</p>
                <p className="text-sm text-muted-foreground">
                  Paracetamol 500mg - María González
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hace 5 minutos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Solicitud aceptada</p>
                <p className="text-sm text-muted-foreground">
                  Metformina 850mg - Carlos Ramírez
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hace 12 minutos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo usuario registrado</p>
                <p className="text-sm text-muted-foreground">
                  Ana Martínez - Donador
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hace 25 minutos
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
