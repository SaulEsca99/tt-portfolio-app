import { Field, FieldError, FieldLabel } from "@/client/components/ui/field";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import * as React from "react";
import { useFieldContext } from "./form-context";

export interface FormSelectProps extends React.ComponentProps<typeof Select> {
  label: string;
  placeholder?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormSelect({
  label,
  placeholder,
  className,
  children,
  ...props
}: FormSelectProps) {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

      <Select
        name={field.name}
        value={field.state.value || ""}
        onValueChange={field.handleChange}
        {...props}
      >
        <SelectTrigger
          id={field.name}
          className={className}
          aria-invalid={isInvalid}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
