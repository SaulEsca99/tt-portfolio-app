import { Card, CardContent } from "@/client/components/ui/card";
import { Skeleton } from "@/client/components/ui/skeleton";

export function MedicationCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <Skeleton className=" h-[300px] w-full rounded-none" />

        <div className="flex items-center gap-4 border-y border-border px-4 py-3">
          <Skeleton className="h-8 w-10" />
          <Skeleton className="h-8 w-10" />
          <Skeleton className="h-8 w-10" />
        </div>

        <div className="space-y-4 px-4 py-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="size-4 shrink-0 rounded-sm" />
                <Skeleton className="h-4 w-full max-w-[180px]" />
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
          </div>

          <Skeleton className="h-16 w-full rounded-lg" />

          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
