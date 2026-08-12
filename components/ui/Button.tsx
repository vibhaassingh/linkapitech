import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "light" | "glass" | "outline" | "quiet" | "accent";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  showArrow?: boolean;
  /** Trailing glyph override (e.g. a mail or speech icon, per the Figma CTAs). */
  icon?: ReactNode;
  /**
   * Magnetic hover pull. Handled by the delegated <Magnetic> listener in the
   * root layout via a data attribute, so this stays a server component.
   * Off for `quiet` (an inline text link shouldn't drift).
   */
  magnetic?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

const base =
  "group inline-flex items-center justify-center gap-2.5 rounded-pill font-semibold transition-all duration-ui ease-out-expo disabled:opacity-60 disabled:pointer-events-none";

const styles: Record<Exclude<Variant, "accent">, string> = {
  /** Brand plum fill — the default CTA on light surfaces. */
  primary:
    "bg-plum-600 px-7 py-[14px] text-[15px] text-ink-inv shadow-card hover:bg-violet-600 hover:shadow-float",
  /** White fill — the primary CTA on plum/dark surfaces. */
  light:
    "bg-surface px-7 py-[14px] text-[15px] text-plum-700 shadow-card hover:bg-white hover:shadow-float",
  /** Liquid-glass secondary on plum surfaces. */
  glass:
    "glass sheen rounded-pill px-7 py-[14px] text-[15px] text-ink-inv hover:bg-white/[0.14]",
  /** Hairline outline on light surfaces. */
  outline:
    "border border-line bg-transparent px-7 py-[13px] text-[15px] text-ink hover:border-plum-600 hover:text-plum-700",
  /** Inline text link with arrow. */
  quiet: "px-0 py-1 text-[15px] text-violet-text hover:text-plum-700",
};

/**
 * Pill button set (Figma Purple): plum fill, white-on-plum, glass secondary,
 * hairline outline, quiet link. Renders <Link> for internal paths, <a>
 * otherwise. ("accent" maps to primary for legacy call sites.)
 */
export function Button({
  children,
  href,
  variant = "primary",
  className,
  showArrow = true,
  icon,
  magnetic,
  type = "button",
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  const v: Exclude<Variant, "accent"> = variant === "accent" ? "primary" : variant;
  const classes = cn(base, styles[v], className);
  // Default on for the pill variants; never for the inline text link.
  const pull = (magnetic ?? v !== "quiet") ? { "data-magnetic": "" } : {};

  const inner = (
    <>
      <span className="relative z-[2]">{children}</span>
      {(showArrow || icon) && (
        <span
          aria-hidden="true"
          className="relative z-[2] transition-transform duration-ui ease-out-expo group-hover:translate-x-0.5"
        >
          {icon ?? <Arrow />}
        </span>
      )}
    </>
  );

  if (href) {
    const internal = href.startsWith("/") && !href.startsWith("//");
    if (internal) {
      return (
        <Link href={href} className={classes} {...pull} {...rest}>
          {inner}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...pull} {...rest}>
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
      {...pull}
      {...rest}
    >
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
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
