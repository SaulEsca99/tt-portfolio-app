"use client";

import Link from "next/link";

import { useStore } from "@tanstack/react-form";

import { AUTH_ROUTES } from "@client/config/routes";

import { Button } from "@client/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@client/components/ui/field";

import { AuthSeparator } from "../components/auth-separator";
import { PasswordStrengthIndicator } from "../components/password-strength-indicator";
import { GoogleAuthButton } from "../components/social-auth-buttons";

import { useSignUp } from "./use-sign-up.hook";

export function SignUpForm() {
  const form = useSignUp();

  const password = useStore(form.store, (state) => state.values.password);

  return (
    <form.AppForm>
      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <Field>
            <GoogleAuthButton label="Registrarse con Google" />
          </Field>

          <AuthSeparator />

          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Nombre completo"
                autoComplete="name"
                placeholder="Juan Pérez"
              />
            )}
          </form.AppField>

          <form.AppField name="email">
            {(field) => (
              <field.Input
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                placeholder="nombre@empresa.com"
              />
            )}
          </form.AppField>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.AppField name="password">
                {(field) => (
                  <field.Password
                    label="Contraseña"
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                )}
              </form.AppField>

              <form.AppField name="confirmPassword">
                {(field) => (
                  <field.Password
                    label="Confirmar"
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                )}
              </form.AppField>
            </div>

            <PasswordStrengthIndicator password={password} />
          </div>

          <Field>
            <Button type="submit" className="w-full mt-4">
              Crear cuenta
            </Button>
            <FieldDescription className="text-center mt-2">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href={AUTH_ROUTES.signIn}
                className="text-primary hover:underline"
              >
                Iniciar sesión
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </form.AppForm>
  );
}
