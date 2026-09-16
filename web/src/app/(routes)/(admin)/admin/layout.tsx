import { guardAdmin } from "@/app/lib/auth-guard";
import { Logo } from "@/client/components/branding/logo";

import { AdminMainContent } from "@/client/modules/governance/components/admin-main-content";
import { AdminNav } from "@/client/modules/governance/components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardAdmin();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <AdminNav />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin User</span>
          </div>
        </div>
      </header>
      <AdminMainContent>{children}</AdminMainContent>
    </div>
  );
}
