import { PUBLIC_ROUTES } from "@/client/config/routes";
import { cn } from "@client/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

const logoVariants = cva("relative inline-block", {
  variants: {
    size: {
      sm: "h-4 md:h-6 w-auto",
      md: "h-6 md:h-8 w-auto",
      lg: "h-10 md:h-12 w-auto",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const LOGO_WIDTH = 200;
const LOGO_HEIGHT = 200;

export interface LogoProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof logoVariants> {
  src?: string;
  alt?: string;
  priority?: boolean;
}

function Logo({
  className,
  size,
  src = "/branding/logo-circle.webp",
  alt = "Logo",
  priority = false,
  ...props
}: LogoProps) {
  return (
    <Link
      href={PUBLIC_ROUTES.home}
      className={cn(logoVariants({ size }), "rounded-full", className)}
      {...props}
    >
      <Image
        src={src}
        alt={alt}
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        className="h-full w-auto object-contain rounded-full"
      />
    </Link>
  );
}

export { Logo, logoVariants };
