import { PUBLIC_ROUTES } from "@/client/config/routes";
import { cn } from "@client/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { LineChartIcon } from "lucide-react";
import * as React from "react";

const logoVariants = cva("relative inline-flex items-center gap-2", {
  variants: {
    size: {
      sm: "text-lg",
      md: "text-xl",
      lg: "text-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface LogoProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof logoVariants> {}

function Logo({ className, size, ...props }: LogoProps) {
  return (
    <Link
      href={PUBLIC_ROUTES.home}
      className={cn(logoVariants({ size }), "font-bold text-primary", className)}
      {...props}
    >
      <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-md p-1.5">
        <LineChartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <span className="tracking-tight">PortfolioApp</span>
    </Link>
  );
}

export { Logo, logoVariants };
