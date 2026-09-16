"use client";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { DropdownMenuItem } from "@client/components/ui/dropdown-menu";

import { authClient } from "@/app/lib/auth-client";

export function SignOutMenuItem() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
      <LogOut />
      Cerrar sesión
    </DropdownMenuItem>
  );
}
