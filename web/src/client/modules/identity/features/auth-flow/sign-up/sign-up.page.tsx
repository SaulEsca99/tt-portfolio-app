import { AuthLayout } from "../components/auth-layout";

import { SignUpForm } from "./sign-up.form";

export function SignUpPage() {
  return (
    <AuthLayout
      title="Crea tu cuenta"
      description="Ingresa tus datos para crear tu cuenta"
    >
      <SignUpForm />
    </AuthLayout>
  );
}
