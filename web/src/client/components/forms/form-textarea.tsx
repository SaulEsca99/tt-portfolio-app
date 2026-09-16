import { Field, FieldError, FieldLabel } from "@/client/components/ui/field";
import { Textarea, TextareaProps } from "@/client/components/ui/textarea";

import { useFieldContext } from "./form-context";

export type FormTextareaProps = TextareaProps & {
  label: string;
};

export function FormTextarea({
  label,
  placeholder,
  autoComplete,
  ...props
}: FormTextareaProps) {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
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
