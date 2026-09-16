"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/client/lib/utils";
import {
  LayoutDashboardIcon,
  BriefcaseBusinessIcon,
  Settings2Icon,
  LineChartIcon,
  BarChart3Icon,
  BotIcon,
} from "lucide-react";
import { Badge } from "@/client/components/ui/badge";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/portfolios/new", label: "Portfolio Builder", icon: BriefcaseBusinessIcon },
  { href: "/optimize", label: "Optimization", icon: Settings2Icon },
  { href: "/backtesting", label: "Backtesting", icon: LineChartIcon },
  { href: "/market-data", label: "Market Data", icon: BarChart3Icon },
  { href: "/assistant", label: "AI Assistant", icon: BotIcon },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar px-4 py-6 gap-1">
      <div className="mb-6 px-2 flex items-center gap-2.5">
        <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <LineChartIcon className="size-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">PortfolioApp</span>
      </div>
      
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
            {label === 'AI Assistant' && (
              <Badge variant="secondary" className="ml-auto px-1.5 py-0 text-[10px]">
                BETA
              </Badge>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
