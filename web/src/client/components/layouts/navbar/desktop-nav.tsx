import Link from "next/link";

import { cn } from "@client/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@client/components/ui/tooltip";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@client/components/ui/navigation-menu";
import { LucideIcon } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  id?: string;
  disabled?: boolean;
};

type DesktopNavProps = {
  menu: NavItem[];
  pathname?: string;
};

export function DesktopNav({ menu, pathname }: DesktopNavProps) {
  return (
    <NavigationMenu
      data-orientation="horizontal"
      className="h-full *:h-full max-md:hidden"
    >
      <NavigationMenuList className="relative h-full gap-2">
        {menu.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Fragment key={item.href}>
              <NavigationMenuItem className="h-full p-1">
                <NavigationMenuLink
                  active={isActive}
                  className={cn(
                    "h-full w-24",
                    isActive && "hover:bg-background",
                    item.disabled && "pointer-events-none opacity-50"
                  )}
                  asChild
                >
                  <Link
                    href={item.href}
                    className="relative"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Tooltip>
                      <TooltipTrigger className="h-full" asChild>
                        <span className="flex justify-center items-center font-medium">
                          <Icon
                            className={cn(
                              "size-6",
                              isActive ? "text-primary" : ""
                            )}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={16} arrow={false}>
                        <p className="font-semibold">{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Link>
                </NavigationMenuLink>

                {isActive && <div className="absolute h-1 w-full bg-primary" />}
              </NavigationMenuItem>
            </Fragment>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
