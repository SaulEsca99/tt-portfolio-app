"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/client/lib/utils";
import {
  LayoutDashboardIcon,
  TrendingUpIcon,
  BarChart3Icon,
  MessageSquareIcon,
  DatabaseIcon,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/portfolios", label: "Portafolios", icon: TrendingUpIcon },
  { href: "/optimize", label: "Optimizar", icon: TrendingUpIcon },
  { href: "/backtesting", label: "Backtesting", icon: BarChart3Icon },
  { href: "/market-data", label: "Datos de mercado", icon: DatabaseIcon },
  { href: "/assistant", label: "Asistente", icon: MessageSquareIcon },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r bg-background px-3 py-6 gap-1">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === href || pathname.startsWith(href + "/")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </aside>
  );
}
