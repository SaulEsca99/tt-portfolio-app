import type { UserProfile } from "@client/types/user";

import { Button } from "@client/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@client/components/ui/dropdown-menu";

import { UserAvatar } from "../../../components/user-avatar";
import { UserDropdownContent } from "./user-dropdown-content";

export interface UserMenuNavbarProps {
  user?: UserProfile;
}

export function UserMenuNavbar({ user }: UserMenuNavbarProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="size-10 rounded-full bg-transparent hover:border-ring hover:ring-[3px] hover:ring-ring/50"
        >
          <UserAvatar name={user?.name} image={user?.image} />
        </Button>
      </DropdownMenuTrigger>

      <UserDropdownContent user={user} />
    </DropdownMenu>
  );
}
