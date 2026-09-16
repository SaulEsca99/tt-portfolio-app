import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@client/components/ui/dropdown-menu";
import type { UserProfile } from "@client/types/user";

import { UserInfoDisplay } from "@client/modules/identity/components/user-info-display";

import { AuthenticatedDropdownContent } from "./authenticated-dropdown-content";
import { UnauthenticatedDropdownContent } from "./unauthenticated-dropdown-content";

interface UserDropdownContentProps {
  user?: UserProfile;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export function UserDropdownContent({
  user,
  side,
  align = "end",
  sideOffset = 4,
}: UserDropdownContentProps) {
  return (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-sm"
      side={side}
      align={align}
      sideOffset={sideOffset}
    >
      <DropdownMenuLabel className="flex gap-2 px-2 py-3 font-normal">
        <UserInfoDisplay user={user} />
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      {user ? (
        <AuthenticatedDropdownContent />
      ) : (
        <UnauthenticatedDropdownContent />
      )}
    </DropdownMenuContent>
  );
}
