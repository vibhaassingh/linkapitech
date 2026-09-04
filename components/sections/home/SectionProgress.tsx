"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useSectionProgress } from "@/components/motion/useSectionProgress";

interface SectionProgressProps {
  children: ReactNode;
  className?: string;
  id?: string;
  "aria-label"?: string;
  style?: CSSProperties;
}

/**
 * SectionProgress — a `<section>` that writes `--sp` (0 → 1 across its own
 * viewport transit) onto itself through useSectionProgress, and nothing else.
 *
 * WHY A WRAPPER (REDESIGN-V4 Part J, Phase 6). The hook needs a ref and an
 * effect, i.e. a client component — but the sections that read `--sp`
 * (WhatWeDo's Conduit flow and its sequenced Nodes) are otherwise pure server
 * markup: content from content/*.ts, the motif kit, RevealGroup. Marking the
 * whole section "use client" would ship its content module and every motif
 * to the browser for one effect. ProcessRail pays that price because its
 * terminal choreography also needs the `--sp-live` publishing effect; here the
 * client boundary is this single element. Server children pass straight
 * through as `children` (React composes them without serialising anything but
 * the tree), so the section stays a server component and the hook is the only
 * JS added.
 *
 * `--sp` inherits, so every descendant reads the section's progress. Under
 * reduced motion the hook is a deliberate no-op and `--sp` keeps its `:root`
 * 0 — every `--sp` consumer rests in its start pose (decoration fails closed;
 * content must read `--sp-live`, which fails open — see ProcessRail).
 */
export function SectionProgress({
  children,
  className,
  ...rest
}: SectionProgressProps) {
  const ref = useRef<HTMLElement | null>(null);
  useSectionProgress(ref);
  return (
    <section ref={ref} className={className} {...rest}>
      {children}
    </section>
  );
}
