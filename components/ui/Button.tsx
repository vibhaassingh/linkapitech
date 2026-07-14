"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useMagnetic } from "@/components/motion/hooks";

type Variant = "primary" | "accent";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  showArrow?: boolean;
  magnetic?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

const base =
  "group relative inline-flex items-center justify-center gap-3.5 rounded-pill font-medium tracking-wide transition-all duration-500 ease-brand disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink px-8 py-5 text-[15px] text-white shadow-[0_14px_40px_-16px_rgba(15,15,14,.55)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-20px_rgba(15,15,14,.7)]",
  accent:
    "bg-accent px-6.5 py-4 text-[15px] font-semibold text-white hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-16px_rgba(74,37,69,.5)]",
};

/**
 * Primary dark pill (light surfaces) and accent lime pill (dark surfaces only),
 * per DESIGN-SYSTEM §5.1–5.2. Renders <Link> for internal paths, <a> otherwise.
 */
export function Button({
  children,
  href,
  variant = "primary",
  className,
  showArrow = true,
  magnetic = false,
  type = "button",
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  const magRef = useMagnetic<HTMLElement>(18);
  const classes = cn(base, variants[variant], className);

  const inner = (
    <>
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 rounded-pill bg-[radial-gradient(circle_at_50%_50%,rgba(74,37,69,.5),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      <span className="relative z-10">{children}</span>
      {showArrow &&
        (variant === "primary" ? (
          <span className="relative z-10 grid h-6.5 w-6.5 place-items-center rounded-full bg-white text-ink transition-transform duration-500 ease-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:-rotate-6 group-hover:bg-accent group-hover:text-white">
            <Arrow />
          </span>
        ) : (
          <span className="relative z-10 transition-transform duration-500 ease-brand group-hover:translate-x-1">
            <Arrow />
          </span>
        ))}
    </>
  );

  const attach = magnetic ? { ref: magRef as never } : {};

  if (href) {
    const internal = href.startsWith("/") && !href.startsWith("//");
    if (internal) {
      return (
        <Link href={href} className={classes} {...attach} {...rest}>
          {inner}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...attach} {...rest}>
        {inner}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...attach}
      {...rest}
    >
      {inner}
    </button>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
