import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "quiet" | "accent";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  showArrow?: boolean;
  /** @deprecated old design's magnetic hover — accepted and ignored until the last legacy consumer is rebuilt */
  magnetic?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

const base =
  "group inline-flex items-center justify-center gap-2.5 rounded-sm font-medium transition-colors duration-ui ease-out-expo disabled:opacity-60 disabled:pointer-events-none";

const styles: Record<Exclude<Variant, "accent">, string> = {
  primary:
    "bg-navy-900 px-7 py-[15px] text-[15px] text-ink-inv hover:bg-navy-700",
  outline:
    "border border-line bg-transparent px-7 py-[14px] text-[15px] text-ink hover:border-ink",
  quiet:
    "px-0 py-1 text-[15px] text-navy-600 hover:text-navy-900",
};

/**
 * Institutional button set: navy fill, hairline outline, quiet link-with-arrow.
 * Renders <Link> for internal paths, <a> otherwise. ("accent" maps to primary
 * for the few not-yet-rebuilt legacy call sites.)
 */
export function Button({
  children,
  href,
  variant = "primary",
  className,
  showArrow = true,
  magnetic: _magnetic,
  type = "button",
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  const v: Exclude<Variant, "accent"> = variant === "accent" ? "primary" : variant;
  const classes = cn(base, styles[v], className);

  const inner = (
    <>
      <span>{children}</span>
      {showArrow && (
        <span
          aria-hidden="true"
          className="transition-transform duration-ui ease-out-expo group-hover:translate-x-0.5"
        >
          <Arrow />
        </span>
      )}
    </>
  );

  if (href) {
    const internal = href.startsWith("/") && !href.startsWith("//");
    if (internal) {
      return (
        <Link href={href} className={classes} {...rest}>
          {inner}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...rest}>
        {inner}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
      {inner}
    </button>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
