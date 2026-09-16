"use client";

import type * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { User as UserIcon } from "lucide-react";

import { cn, getInitials } from "@client/lib/utils";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@client/components/ui/avatar";

const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
      },
      rounded: {
        full: "rounded-full",
        lg: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "md",
      rounded: "full",
    },
  }
);

export interface UserAvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  name?: string | null;
  image?: string | null;
}

export function UserAvatar({
  name,
  image,
  size,
  rounded,
  className,
  ...props
}: UserAvatarProps) {
  return (
    <div className={cn("flex", className)} {...props}>
      <Avatar className={cn(avatarVariants({ size, rounded }))}>
        <AvatarImage src={image ?? undefined} alt={name ?? "user avatar"} />
        <AvatarFallback
          className={cn(
            "flex items-center justify-center bg-muted font-medium text-foreground/80",
            avatarVariants({ size, rounded })
          )}
        >
          {name ? (
            getInitials(name)
          ) : (
            <UserIcon className="size-6 opacity-70" />
          )}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
