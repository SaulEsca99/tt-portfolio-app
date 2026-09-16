import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth";
import { DashboardSidebar } from "@/client/components/layouts/dashboard-sidebar";

export default async function DashboardLayout({ children }: React.PropsWithChildren) {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
