"use client";

import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  className?: string; // wrapper
  inputClassName?: string; // input
  labelClassName?: string; // label
};

export function FormInput<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  className,
  inputClassName,
  labelClassName,
}: Props<T>) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={cn("space-y-2", className)}
        >
          <FieldLabel className={cn(labelClassName)}>{label}</FieldLabel>

          <Input
            {...field}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            className={cn(
              fieldState.invalid && "border-red-500",
              inputClassName,
            )}
          />

          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
