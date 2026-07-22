import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const wrap = "flex flex-col gap-2 mb-5";
const labelCls = "text-[13px] font-medium text-ink-2";
const control =
  "w-full rounded-sm border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none transition-colors duration-ui placeholder:text-ink-3/60 hover:border-steel focus:border-navy-600 focus:ring-1 focus:ring-navy-600";
const errCls = "text-[12.5px] text-[#b3261e]";

interface Base {
  label: string;
  error?: string;
}

/** Boxed institutional text field. Forwards ref for react-hook-form. */
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

/** Boxed textarea variant. */
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
        className={cn(control, "min-h-[120px] resize-y", className)}
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
