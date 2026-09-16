import { cn } from "@/client/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client/components/ui/card";

interface AuthCardLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  className,
  children,
  ...props
}: AuthCardLayoutProps) {
  return (
    <Card
      className={cn("w-full border-none shadow-md sm:max-w-md", className)}
      {...props}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
