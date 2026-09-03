import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DropletProps {
  children: ReactNode;
  /** Light-section variant: `.liq liq-light liq-1`, violet dot. */
  light?: boolean;
  as?: "span" | "p" | "div";
  className?: string;
}

/**
 * Droplet — the small liquid pill (REDESIGN-V4 Part C): a `.liq liq-1`
 * capsule with a 4px specular dot at the leading edge. It is a VISUAL
 * CAPSULE, not an eyebrow replacement — it wraps whatever it is given, and
 * Phase 4+ decides where it wraps <Eyebrow>. Text colour is inherited: on the
 * light variant the wrapped text must clear `.liq-light.liq-1`'s matrix
 * (`--ink` / `--ink-2` / `--violet-text`; `--ink-3` fails at 4.17 — §A6).
 *
 * Padding is Tailwind here, not CSS, so a call site can override it through
 * `className` (a `.droplet` padding would out-rank `px-*` at equal
 * specificity). `.liq-1` has no blur below 1024. Styles in motifs.css.
 */
export function Droplet({
  children,
  light,
  as: Tag = "span",
  className,
}: DropletProps) {
  return (
    <Tag
      className={cn(
        "liq liq-1 rounded-pill droplet px-3.5 py-1.5",
        light && "liq-light droplet-light",
        className,
      )}
    >
      <span className="droplet-dot" aria-hidden="true" />
      {children}
    </Tag>
  );
}
