import { Badge } from "@/client/components/ui/badge";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function SettingsSectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
      {title}
    </h3>
  );
}

export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden shadow-sm">
      {children}
    </div>
  );
}

interface SettingsRowLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  value?: string | number;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
  destructive?: boolean;
}

export function SettingsRowLink({
  href,
  icon: Icon,
  label,
  value,
  badge,
  badgeVariant = "default",
  destructive,
}: SettingsRowLinkProps) {
  const iconClass = destructive
    ? "bg-destructive/10 text-destructive"
    : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80";

  const textClass = destructive ? "text-destructive" : "text-foreground";

  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-all group"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${iconClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-medium text-sm ${textClass}`}>{label}</p>
          {badge && (
            <Badge variant={badgeVariant} className="text-[10px] px-1.5 h-5">
              {badge}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {value && (
            <p className="text-sm text-muted-foreground truncate">{value}</p>
          )}
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
    </Link>
  );
}
