"use client";

import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;

  // 🎨 full design control
  className?: string; // wrapper
  inputClassName?: string; // input
  labelClassName?: string; // label
  iconClassName?: string; // icon button
  containerClassName?: string; // input wrapper
};

export function FormPassword<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  className,
  inputClassName,
  labelClassName,
  iconClassName,
  containerClassName,
}: Props<T>) {
  const [show, setShow] = useState(false);

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

          <div className={cn("relative", containerClassName)}>
            <Input
              {...field}
              type={show ? "text" : "password"}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              className={cn(
                "pr-10",
                fieldState.invalid &&
                  "border-red-500 focus-visible:ring-red-500",
                inputClassName,
              )}
            />

            {/* 👁️ Eye toggle */}
            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              aria-label="Toggle password visibility"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition",
                iconClassName,
              )}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
