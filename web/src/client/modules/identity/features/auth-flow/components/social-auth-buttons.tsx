"use client";

import { useState } from "react";
import { toast } from "sonner";

import { PUBLIC_ROUTES } from "@/client/config/routes";

import { authClient } from "@/app/lib/auth-client";
import { type ButtonProps, Button } from "@/client/components/ui/button";
import { Spinner } from "@/client/components/ui/spinner";

import { GoogleIcon } from "../assets/google-icon";

interface SocialAuthButtonProps extends ButtonProps {
  icon: React.ReactNode;
  label: string;
  loadingText?: string;
}

function SocialAuthButton({
  icon,
  label,
  loadingText = "Conectando...",
  disabled,
  ...props
}: SocialAuthButtonProps) {
  const isLoading = disabled && props["aria-busy"] === "true";

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full gap-2"
      disabled={disabled}
      {...props}
    >
      {isLoading ? <Spinner /> : icon}
      <span>{isLoading ? loadingText : label}</span>
    </Button>
  );
}

interface GoogleAuthButtonProps {
  disabled?: boolean;
  callbackURL?: string;
  label: string;
  loadingText?: string;
}

function useGoogleAuth(callbackURL: string) {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    try {
      setIsLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al iniciar sesión con Google"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}

export function GoogleAuthButton({
  disabled = false,
  callbackURL = PUBLIC_ROUTES.home,
  label,
  loadingText,
  ...props
}: GoogleAuthButtonProps) {
  const { signIn, isLoading } = useGoogleAuth(callbackURL);

  return (
    <SocialAuthButton
      {...props}
      onClick={signIn}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? "true" : "false"}
      label={label}
      loadingText={loadingText}
      icon={<GoogleIcon className="size-4" />}
    />
  );
}
