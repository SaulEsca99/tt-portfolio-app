import { Field, FieldError, FieldLabel } from "@/client/components/ui/field";
import { Input, InputProps } from "@/client/components/ui/input";

import { useFieldContext } from "./form-context";

export type FormInputProps = InputProps & {
  label: string;
};

export function FormInput({
  label,
  placeholder,
  autoComplete,
  ...props
}: FormInputProps) {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${field.name}-error` : undefined}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...props}
      />

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
