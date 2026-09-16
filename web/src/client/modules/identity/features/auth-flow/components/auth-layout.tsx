import AuthBackgroundShape from "../assets/auth-background-shape";

import { AuthCard } from "./auth-card";
import { AuthTermsFooter } from "./auth-terms-footer";

export function AuthLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="relative bg-muted flex flex-1 items-center justify-center overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute">
        <AuthBackgroundShape />
      </div>

      <div className="z-1 flex w-full flex-col gap-6 max-w-sm sm:max-w-md">
        <AuthCard title={title} description={description}>
          {children}
        </AuthCard>
        <AuthTermsFooter />
      </div>
    </main>
  );
}
