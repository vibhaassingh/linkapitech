import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const wrap = "flex flex-col gap-2 mb-5";
const labelCls =
  "text-[11.5px] font-semibold uppercase tracking-eyebrow text-ink-3";
const control =
  "w-full rounded-md border border-line bg-canvas px-4 py-3 text-[15px] text-ink outline-none transition-colors duration-ui placeholder:text-[color:var(--ink-placeholder)] hover:border-lavender-400 focus:border-plum-600 focus:bg-surface focus:ring-1 focus:ring-plum-600";
const errCls = "text-[12.5px] text-[color:var(--error)]";

interface Base {
  label: string;
  error?: string;
}

/** Boxed text field. Forwards ref for react-hook-form. */
export const TextField = forwardRef<
  HTMLInputElement,
  Base & InputHTMLAttributes<HTMLInputElement>
>(function TextField({ label, error, className, id, ...rest }, ref) {
  const inputId = id ?? rest.name;
  const errId = error ? `${inputId}-error` : undefined;
  return (
    <div className={wrap}>
      <label htmlFor={inputId} className={labelCls}>
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={errId}
        className={cn(
          control,
          error && "border-[color:var(--error)]",
          className,
        )}
        {...rest}
      />
      {error && (
        <p id={errId} className={errCls}>
          {error}
        </p>
      )}
    </div>
  );
});

/** Multi-line variant. */
export const TextArea = forwardRef<
  HTMLTextAreaElement,
  Base & TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ label, error, className, id, rows = 4, ...rest }, ref) {
  const inputId = id ?? rest.name;
  const errId = error ? `${inputId}-error` : undefined;
  return (
    <div className={wrap}>
      <label htmlFor={inputId} className={labelCls}>
        {label}
      </label>
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={errId}
        className={cn(
          control,
          "resize-y",
          error && "border-[color:var(--error)]",
          className,
        )}
        {...rest}
      />
      {error && (
        <p id={errId} className={errCls}>
          {error}
        </p>
      )}
    </div>
  );
});
