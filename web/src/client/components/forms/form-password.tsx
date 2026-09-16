import type { HTMLInputAutoCompleteAttribute } from "react";
import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Field, FieldError, FieldLabel } from "@client/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@client/components/ui/input-group";

import { useFieldContext } from "./form-context";

export type FormPasswordProps = {
  label: string;
  placeholder?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute;
};

export function FormPassword({
  label,
  placeholder,
  autoComplete = "current-password",
}: FormPasswordProps) {
  const field = useFieldContext<string>();
  const [showPassword, setShowPassword] = useState(false);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type={showPassword ? "text" : "password"}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-xs"
            className="rounded-full"
            onClick={togglePasswordVisibility}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
