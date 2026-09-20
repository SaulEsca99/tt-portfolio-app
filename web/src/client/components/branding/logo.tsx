import { PUBLIC_ROUTES } from "@/client/config/routes";
import { cn } from "@client/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import Image from "next/image";
import * as React from "react";

const logoVariants = cva("relative inline-flex items-center", {
  variants: {
    size: {
      sm: "h-8",
      md: "h-10",
      lg: "h-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface LogoProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof logoVariants> {
  iconOnly?: boolean;
}

function Logo({ className, size, iconOnly = false, ...props }: LogoProps) {
  return (
    <Link
      href={PUBLIC_ROUTES.home}
      className={cn(logoVariants({ size }), className)}
      {...props}
    >
      {iconOnly ? (
        <Image
          src="/bionvest-icon.png"
          alt="Bionvest"
          width={40}
          height={40}
          className="h-full w-auto object-contain"
        />
      ) : (
        <Image
          src="/bionvest-logo.png"
          alt="Bionvest – Bio-Inspired Investment"
          width={180}
          height={48}
          className="h-full w-auto object-contain"
          priority
        />
      )}
    </Link>
  );
}

export { Logo, logoVariants };

