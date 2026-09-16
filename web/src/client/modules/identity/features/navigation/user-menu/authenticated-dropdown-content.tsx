import { Fragment } from "react";

import { DropdownMenuSeparator } from "@/client/components/ui/dropdown-menu";

import { SettingsMenuItem } from "./settings-menu-item";
import { SignOutMenuItem } from "./sign-out-menu-item";

export function AuthenticatedDropdownContent() {
  return (
    <Fragment>
      <SettingsMenuItem />

      <DropdownMenuSeparator />

      <SignOutMenuItem />
    </Fragment>
  );
}
