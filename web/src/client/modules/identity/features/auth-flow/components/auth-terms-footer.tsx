import Link from "next/link";

import { FieldDescription } from "@client/components/ui/field";

export function AuthTermsFooter() {
  return (
    <FieldDescription className="px-6 text-center">
      Al continuar, aceptas nuestros{" "}
      <Link href={"#"}>Términos de servicio</Link> y{" "}
      <Link href={"#"}>Política de privacidad</Link>.
    </FieldDescription>
  );
}
