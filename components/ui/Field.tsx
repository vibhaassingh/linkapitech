import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const wrap = "flex flex-col gap-2 mb-6";
const labelCls = "text-[11px] uppercase tracking-[.15em] text-ink-2";
const control =
  "bg-transparent border-0 border-b border-line py-2.5 text-[16px] text-ink outline-none transition-colors duration-300 focus:border-ink placeholder:text-ink-3/50";
const errCls = "text-[12px] text-[#c0392b]";

interface Base {
  label: string;
  error?: string;
}

/** Underline text field (DESIGN-SYSTEM §5.9). Forwards ref for react-hook-form. */
export const TextField = forwardRef<
  HTMLInputElement,
  Base & InputHTMLAttributes<HTMLInputElement>
>(function TextField({ label, error, id, name, className, ...rest }, ref) {
  const fieldId = id ?? name;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className={wrap}>
      <label htmlFor={fieldId} className={labelCls}>
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        ref={ref}
        className={cn(control, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <span id={errorId} role="alert" className={errCls}>
          {error}
        </span>
      )}
    </div>
  );
});

/** Underline textarea variant. */
export const TextArea = forwardRef<
  HTMLTextAreaElement,
  Base & TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ label, error, id, name, className, ...rest }, ref) {
  const fieldId = id ?? name;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className={wrap}>
      <label htmlFor={fieldId} className={labelCls}>
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        ref={ref}
        className={cn(control, "min-h-[90px] resize-y", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <span id={errorId} role="alert" className={errCls}>
          {error}
        </span>
      )}
    </div>
  );
});
