"use client";

import type React from "react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/client/components/ui/sidebar";
import { SettingsHeader } from "@/client/modules/identity/features/account-management/components/settings-header";
import { SettingsSidebar } from "@/client/modules/identity/features/account-management/components/settings-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SettingsHeader />

      <SidebarProvider
        style={
          {
            "--sidebar-width": "18rem",
          } as React.CSSProperties
        }
        className="flex-1"
      >
        <SettingsSidebar className="top-16 h-[calc(100svh-4rem)] border-r border-border" />

        <SidebarInset>
          <main className="flex-1 ">
            <div className="lg:hidden p-4 pb-0">
              <SidebarTrigger variant="outline" />
            </div>

            <div className="mx-auto max-w-5xl p-4 lg:p-8">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
