import { cn } from "@/client/lib/utils";

export function AdminMainContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("container mx-auto px-4 xl:p-10 py-8", className)}>
      {children}
    </main>
  );
}
