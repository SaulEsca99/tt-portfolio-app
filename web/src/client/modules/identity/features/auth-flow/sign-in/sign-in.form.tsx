"use client";

import { AUTH_ROUTES } from "@/client/config/routes";
import Link from "next/link";

import { Button } from "@/client/components/ui/button";
import { Checkbox } from "@/client/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/client/components/ui/field";

import { AuthSeparator } from "../components/auth-separator";
import { GoogleAuthButton } from "../components/social-auth-buttons";
import { useSignIn } from "./use-sign-in.hook";

export function SignInForm() {
  const form = useSignIn();

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <Field>
            <GoogleAuthButton label="Iniciar sesión con Google" />
          </Field>

          <AuthSeparator />

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

          <form.AppField name="password">
            {(field) => (
              <field.Password
                label="Contraseña"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            )}
          </form.AppField>

          <form.AppField name="rememberMe">
            {(field) => (
              <Field orientation="horizontal" className="items-center gap-2">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                />
                <FieldLabel
                  htmlFor={field.name}
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  Recuérdame
                </FieldLabel>

                <Link
                  href={"#"} // TODO: Implementar Forgot Password más adelante
                  className="ml-auto text-sm font-medium underline-offset-4 hover:underline text-primary"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Field>
            )}
          </form.AppField>

          <Field>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              // eslint-disable-next-line react/no-children-prop
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              )}
            />

            <FieldDescription className="text-center mt-2">
              ¿No tienes una cuenta?{" "}
              <Link
                href={AUTH_ROUTES.signUp}
                className="text-primary hover:underline font-medium"
              >
                Regístrate
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </form.AppForm>
  );
}
