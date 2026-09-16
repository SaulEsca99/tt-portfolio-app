"use client";

import { ADMIN_ROUTES } from "@/client/config/routes";
import { cn } from "@/client/lib/utils";
import { FileText, LayoutDashboard, Pill, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    title: "Dashboard",
    href: ADMIN_ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "Medicamentos",
    href: ADMIN_ROUTES.medications,
    icon: Pill,
  },
  {
    title: "Solicitudes",
    href: ADMIN_ROUTES.requests,
    icon: FileText,
  },
  {
    title: "Usuarios",
    href: ADMIN_ROUTES.users,
    icon: Users,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
