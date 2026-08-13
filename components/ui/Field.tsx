"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const wrap = "flex flex-col gap-2 mb-6";
const labelCls =
  "text-[11.5px] font-semibold uppercase tracking-eyebrow text-ink-3";
/**
 * The native focus outline is switched off here because the sprung ring below
 * replaces it. That swap is safe in both directions: `focus-visible:outline-none`
 * and `peer-focus-visible:*` are gated on the SAME selector, so a browser that
 * does not support `:focus-visible` keeps the base outline from globals.css and
 * simply never shows the ring.
 */
const control =
  "peer block w-full rounded-md border border-line bg-canvas px-4 py-3 text-[15px] text-ink outline-none transition-colors duration-ui placeholder:text-[color:var(--ink-placeholder)] hover:border-lavender-400 focus:border-plum-600 focus:bg-surface focus-visible:outline-none";
/**
 * Focus ring as a real element rather than a `focus:ring-*` box-shadow, so it
 * can be transformed: it scales up from .95 on `--spring-snappy`, which
 * overshoots (its `linear()` stop list peaks at 1.034) and settles. Transform +
 * opacity only, `pointer-events-none`, absolutely positioned — it cannot move
 * the field or intercept a click, so CLS stays 0.
 *
 * Reduced motion: the global block collapses `transition-duration` to 0.001ms,
 * so the ring appears at full size instantly. The focus indicator itself is
 * never conditional on motion.
 */
const ringCls =
  "pointer-events-none absolute inset-0 rounded-md ring-2 ring-plum-600 scale-95 opacity-0 transition-[transform,opacity] duration-[var(--dur-spring-snappy)] ease-[var(--spring-snappy)] peer-focus-visible:scale-100 peer-focus-visible:opacity-100";
const errCls = "text-[12.5px] text-[color:var(--error)]";

/**
 * Autofill: Chrome/Safari paint their own canary-yellow fill and near-black
 * text, which overrides every author background. The inset box-shadow trick is
 * the only way to repaint it — spread is large enough to cover a 4-row textarea.
 * `-webkit-text-fill-color` is what actually re-colours autofilled text.
 *
 * Emitted with React 19's `href` + `precedence` so it is hoisted into <head>
 * and de-duplicated across every field on the page.
 */
const AF_ID = "s7-field-autofill";
const AF_CSS = `
input:-webkit-autofill,textarea:-webkit-autofill{
-webkit-box-shadow:0 0 0 200px var(--canvas) inset;box-shadow:0 0 0 200px var(--canvas) inset;
-webkit-text-fill-color:var(--ink);caret-color:var(--ink)}
input:-webkit-autofill:focus,textarea:-webkit-autofill:focus{
-webkit-box-shadow:0 0 0 200px var(--surface) inset;box-shadow:0 0 0 200px var(--surface) inset}
`;

function AutofillStyle() {
  return (
    <style href={AF_ID} precedence="default">
      {AF_CSS}
    </style>
  );
}

interface Base {
  label: string;
  error?: string;
  /**
   * Monotonic tick from the form. Every increment replays the `.shake` nudge —
   * but only while this field is actually in error, so a valid field beside a
   * bad one stays still.
   */
  shake?: number;
}

/**
 * Replays `.shake` on each new tick.
 *
 * A CSS animation only restarts when it is re-applied, so the class has to be
 * removed, the removal flushed (the `offsetWidth` read), and the class re-added.
 * The class is ALSO part of the rendered className once `shake` has fired, which
 * is what keeps this safe: a later re-render re-emits `shake`, so React can
 * never wipe what this effect added — the failure mode that made the old
 * imperative reveal system unreliable.
 */
function useShake(active: boolean, tick: number | undefined) {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || !tick || !active) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }, [tick, active]);
  return boxRef;
}

/** Boxed text field. Forwards ref for react-hook-form. */
export const TextField = forwardRef<
  HTMLInputElement,
  Base & InputHTMLAttributes<HTMLInputElement>
>(function TextField({ label, error, shake, className, id, ...rest }, ref) {
  const inputId = id ?? rest.name;
  const errId = error ? `${inputId}-error` : undefined;
  const invalid = Boolean(error);
  const boxRef = useShake(invalid, shake);
  return (
    <div className={wrap}>
      <AutofillStyle />
      <label htmlFor={inputId} className={labelCls}>
        {label}
      </label>
      <div
        ref={boxRef}
        className={cn("relative", invalid && shake ? "shake" : undefined)}
      >
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
        <span aria-hidden="true" className={ringCls} />
      </div>
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
>(function TextArea(
  { label, error, shake, className, id, rows = 4, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  const errId = error ? `${inputId}-error` : undefined;
  const invalid = Boolean(error);
  const boxRef = useShake(invalid, shake);
  return (
    <div className={wrap}>
      <AutofillStyle />
      <label htmlFor={inputId} className={labelCls}>
        {label}
      </label>
      <div
        ref={boxRef}
        className={cn("relative", invalid && shake ? "shake" : undefined)}
      >
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
        <span aria-hidden="true" className={ringCls} />
      </div>
      {error && (
        <p id={errId} className={errCls}>
          {error}
        </p>
      )}
    </div>
  );
});
