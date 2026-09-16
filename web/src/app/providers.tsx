"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as React from "react";

import { Toaster } from "@/client/components/ui/sonner";
import { getQueryClient } from "@/client/lib/get-query-client";
import { ImageKitProvider } from "@imagekit/next";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ImageKitProvider urlEndpoint="https://ik.imagekit.io/tnwperzsv">
        {children}
      </ImageKitProvider>
      <ReactQueryDevtools initialIsOpen={false} />

      <Toaster position="top-center" theme="light" richColors />
    </QueryClientProvider>
  );
}
