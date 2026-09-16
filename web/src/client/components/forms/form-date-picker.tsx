"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/client/components/ui/button";
import { Calendar } from "@/client/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/client/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui/popover";
import { cn } from "@/client/lib/utils";

import { PropsBase } from "react-day-picker";
import { useFieldContext } from "./form-context";

interface FormDatePickerProps {
  label: string;
  placeholder?: string;
  description?: string;
  startMonth?: PropsBase["startMonth"];
  endMonth?: PropsBase["endMonth"];
  disabled?: PropsBase["disabled"];
}

export function FormDatePicker({
  label,
  placeholder = "Selecciona una fecha",
}: FormDatePickerProps) {
  const field = useFieldContext<Date | undefined>();
  const value = field.state.value;

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const [open, setOpen] = React.useState(false);

  return (
    <Field data-invalid={isInvalid} className="flex flex-col gap-2">
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={field.name}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            type="button"
            className={cn(
              "w-full justify-between font-normal text-left",
              !value && "text-muted-foreground",
              isInvalid &&
                "border-destructive text-destructive focus-visible:ring-destructive"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="h-4 w-4 opacity-50" />
              {value ? (
                format(value, "PPP", { locale: es })
              ) : (
                <span>{placeholder}</span>
              )}
            </span>
            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={(date) => {
              field.handleChange(date);
              setOpen(false);
            }}
            locale={es}
            captionLayout="dropdown"
            startMonth={new Date(0)}
            endMonth={new Date(2040, 0)}
            disabled={(date: Date) => date < new Date()}
          />
        </PopoverContent>
      </Popover>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
