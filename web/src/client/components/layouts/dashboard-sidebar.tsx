"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/client/lib/utils";
import { Logo } from "@/client/components/branding/logo";
import {
  LayoutDashboardIcon,
  BriefcaseBusinessIcon,
  Settings2Icon,
  LineChartIcon,
  BarChart3Icon,
  BotIcon,
} from "lucide-react";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { useT } from "@/client/lib/i18n/i18n-context";

const navHrefs = [
  { href: "/dashboard", icon: LayoutDashboardIcon, key: "dashboard" },
  { href: "/portfolios/new", icon: BriefcaseBusinessIcon, key: "portfolioBuilder" },
  { href: "/optimize", icon: Settings2Icon, key: "optimization" },
  { href: "/backtesting", icon: LineChartIcon, key: "backtesting" },
  { href: "/market-data", icon: BarChart3Icon, key: "marketData" },
  { href: "/assistant", icon: BotIcon, key: "aiAssistant" },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const { t, toggleLang } = useT();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar px-4 py-6 gap-1">
      <div className="mb-6 px-2">
        <Logo size="md" />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navHrefs.map(({ href, icon: Icon, key }) => {
          const label = t.nav[key];
          const isAI = key === "aiAssistant";
          return (
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
              {isAI && (
                <Badge variant="secondary" className="ml-auto px-1.5 py-0 text-[10px]">
                  BETA
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Language switcher */}
      <div className="mt-4 px-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLang}
          className="w-full gap-2 text-xs"
        >
          🌐 {t.lang.toggle}
        </Button>
      </div>
    </aside>
  );
}
