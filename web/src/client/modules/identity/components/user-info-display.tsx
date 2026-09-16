import { User } from "lucide-react";
import { Fragment } from "react";

import type { UserProfile } from "@client/types/user";

import { UserAvatar } from "./user-avatar";

interface UserInfoDisplayProps {
  user?: UserProfile;
  avatarSize?: "sm" | "md" | "lg";
}

interface UserInfoProps {
  title: string;
  subtitle: string;
}

function UserInfo({ title, subtitle }: UserInfoProps) {
  return (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-semibold">{title}</span>
      <span className="truncate text-muted-foreground text-xs">{subtitle}</span>
    </div>
  );
}

function GuestAvatar() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
      <User className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}

export function UserInfoDisplay({
  user,
  avatarSize = "md",
}: UserInfoDisplayProps) {
  const avatar = user ? (
    <UserAvatar name={user.name} image={user.image} size={avatarSize} />
  ) : (
    <GuestAvatar />
  );

  const info = user ? (
    <UserInfo title={user.name} subtitle={user.email} />
  ) : (
    <UserInfo title="Invitado" subtitle="No has iniciado sesión" />
  );

  return (
    <Fragment>
      {avatar}

      {info}
    </Fragment>
  );
}
