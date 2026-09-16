import { AuthLayout } from "../components/auth-layout";

import { SignInForm } from "./sign-in.form";

export function SignInPage() {
  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      description="Ingresa tus credenciales para acceder a tu cuenta"
    >
      <SignInForm />
    </AuthLayout>
  );
}
