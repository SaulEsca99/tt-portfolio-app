import { Card, CardContent } from "@/client/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/client/lib/utils";

export function StatCard({ label, value, detail, positive = true }: { label: string; value: string; detail: string; positive?: boolean }) {
  return (
    <Card className="border-border/70 bg-card/70 shadow-none">
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <span className={cn('text-xs font-medium', positive ? 'text-primary' : 'text-destructive')}>
            {positive ? <ArrowUpRight className="mr-0.5 inline size-3" /> : <ArrowDownRight className="mr-0.5 inline size-3" />}
            {detail}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-sm text-primary">{eyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
