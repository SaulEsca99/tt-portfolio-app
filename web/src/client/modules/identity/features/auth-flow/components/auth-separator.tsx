import { FieldSeparator } from "@client/components/ui/field";

export function AuthSeparator() {
  return (
    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
      O continuar con
    </FieldSeparator>
  );
}
