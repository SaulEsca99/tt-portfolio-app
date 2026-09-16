import { cn } from "@client/lib/utils";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  children: React.ReactNode;
}

function Header({
  className,
  sticky = false,
  children,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "w-full border-border/40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        sticky && "sticky top-0 z-50",
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
}

interface HeaderContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function HeaderContainer({
  className,
  children,
  ...props
}: HeaderContainerProps) {
  return (
    <div
      className={cn(
        "container grid h-16 max-w-screen-2xl grid-cols-[1fr_auto_1fr] px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface HeaderMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function HeaderMedia({ className, children, ...props }: HeaderMediaProps) {
  return (
    <div className={cn("flex items-center", className)} {...props}>
      {children}
    </div>
  );
}

interface HeaderContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function HeaderContent({ className, children, ...props }: HeaderContentProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface HeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function HeaderActions({ className, children, ...props }: HeaderActionsProps) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Header, HeaderActions, HeaderContainer, HeaderContent, HeaderMedia };
