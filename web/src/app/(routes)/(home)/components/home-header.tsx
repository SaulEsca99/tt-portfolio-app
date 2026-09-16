"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboardIcon,
  TrendingUpIcon,
} from "lucide-react";

import {
  DesktopNav,
  type NavItem as DesktopNavItem,
} from "@/client/components/layouts/navbar/desktop-nav";
import { Logo } from "@client/components/branding/logo";
import {
  Header,
  HeaderActions,
  HeaderContainer,
  HeaderContent,
  HeaderMedia,
} from "@client/components/layouts/header";
import { authClient } from "@/app/lib/auth-client";
import { Button } from "@/client/components/ui/button";
import { UserMenuNavbar } from "@/client/modules/identity/features/navigation/user-menu/user-menu-navbar";

export function HomeHeader() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const navMenu: DesktopNavItem[] = [
    { href: "/", label: "Inicio", icon: TrendingUpIcon },
    ...(session?.user
      ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon }]
      : []),
  ];

  return (
    <Header sticky={true}>
      <HeaderContainer className="h-16">
        <HeaderMedia>
          <Logo size="lg" />
        </HeaderMedia>

        <HeaderContent className="mx-auto">
          <DesktopNav menu={navMenu} pathname={pathname} />
        </HeaderContent>

        <HeaderActions>
          {session?.user ? (
            <UserMenuNavbar user={session.user} />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Iniciar sesión</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Registrarse</Link>
              </Button>
            </div>
          )}
        </HeaderActions>
      </HeaderContainer>
    </Header>
  );
}
