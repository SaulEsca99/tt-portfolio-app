import { LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import { AUTH_ROUTES } from "@/client/config/routes";
import { DropdownMenuItem } from "@client/components/ui/dropdown-menu";

export function UnauthenticatedDropdownContent() {
  return (
    <Fragment>
      <DropdownMenuItem asChild>
        <Link
          href={AUTH_ROUTES.signIn}
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          <span>Iniciar sesión</span>
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <Link
          href={AUTH_ROUTES.signUp}
          className="flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Crear cuenta</span>
        </Link>
      </DropdownMenuItem>
    </Fragment>
  );
}
