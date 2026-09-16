"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/client/components/ui/sidebar";
import { cn } from "@/client/lib/utils";
import { ChevronLeft, Settings, Shield, User, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "General",
    href: "/settings",
    icon: Settings,
    description: "Vista general y preferencias",
  },
  {
    name: "Perfil",
    href: "/settings/profile",
    icon: User,
    description: "Información personal y pública",
  },
  {
    name: "Cuenta",
    href: "/settings/account",
    icon: UserCog,
    description: "Exportar datos y zona de peligro",
  },
  {
    name: "Seguridad",
    href: "/settings/security",
    icon: Shield,
    description: "Contraseña y autenticación",
  },
];

export function SettingsSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <Sidebar className={className} variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-16 border-b border-border justify-center px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="default"
              tooltip="Volver al inicio"
            >
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold text-foreground"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                <span>Configuración</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all h-auto",
                        isActive
                          ? "bg-muted/80 text-foreground"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground/80"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5 mt-0.5 shrink-0" />

                        <div className="flex flex-col gap-0.5 text-left leading-tight">
                          <span className="font-medium text-sm">
                            {item.name}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-normal line-clamp-2",
                              isActive
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
