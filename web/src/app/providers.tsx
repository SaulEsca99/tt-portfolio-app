"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as React from "react";

import { Toaster } from "@/client/components/ui/sonner";
import { getQueryClient } from "@/client/lib/get-query-client";
import { I18nProvider } from "@/client/lib/i18n/i18n-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster position="top-center" theme="light" richColors />
      </QueryClientProvider>
    </I18nProvider>
  );
}
