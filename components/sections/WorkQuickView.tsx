"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CaseStudy } from "@/content/cases";
import { TONE_BG } from "@/content/cases";
import { getLenis } from "@/components/motion/SmoothScrollProvider";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

/**
 * Works "quick view" (PLAN §8, PAGES-AND-ROUTING §2–3). Rendered by the
 * root-level `@modal` intercepting route on soft navigation to /work/[slug];
 * a hard load of that URL renders the full page instead. Self-contained scroll
 * lock via the Lenis singleton (this tree is NOT under SmoothScrollProvider),
 * Escape/backdrop/close-button dismissal, focus trap, and reduced-motion-safe
 * entrance (the CSS snaps the transitions under `prefers-reduced-motion`).
 */
export function WorkQuickView({ c }: { c: CaseStudy }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => router.back(), [router]);

  // Freeze the background: stop Lenis if it's driving the page underneath, and
  // always lock native overflow as a fallback (inner /work index has no Lenis).
  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  // Focus management + trap + Escape (mirrors the MobileMenu dialog pattern).
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [close]);

  const blocks = [c.challenge, c.solution, c.outcome];

  return (
    <div className="qv" role="dialog" aria-modal="true" aria-labelledby="qv-title">
      <button
        type="button"
        className="qv-backdrop"
        aria-label="Close quick view"
        tabIndex={-1}
        onClick={close}
      />

      <div ref={dialogRef} className="qv-panel no-scrollbar" data-lenis-prevent>
        {/* Cover */}
        <div
          className="qv-cover relative grid place-items-center overflow-hidden rounded-t-[20px]"
          style={{ background: TONE_BG[c.tone] }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,166,197,.16),transparent_55%)]" />
          <span className="absolute left-5 top-5 z-10">
            <Chip variant="glass">{c.industry}</Chip>
          </span>
          <span className="absolute right-5 top-5 z-10 text-[11px] uppercase tracking-eyebrow text-white/60">
            {c.year}
          </span>
          <div className="px-6 text-center">
            <p className="text-[11px] uppercase tracking-eyebrow text-white/50">{c.kicker}</p>
            <h2
              id="qv-title"
              className="mt-2.5 font-serif text-[clamp(26px,4.4vw,48px)] italic leading-tight text-white"
            >
              {c.name}
            </h2>
          </div>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close quick view"
          className="qv-close"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Body */}
        <div className="px-6 py-8 md:px-9 md:py-9">
          <p className="max-w-[60ch] text-[clamp(15px,1.5vw,19px)] leading-relaxed text-ink">
            {c.intro}
          </p>

          {/* Meta */}
          <dl className="mt-7 grid grid-cols-2 gap-5 border-y border-line py-6 sm:grid-cols-4">
            <Meta label="Industry" value={c.industry} />
            <Meta label="Services" value={c.services} />
            <Meta label="Timeline" value={c.timeline} />
            <Meta label="Role" value={c.role} />
          </dl>

          {/* Challenge / Approach / Outcome */}
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {blocks.map((b) => (
              <div key={b.heading} className="rounded-card border border-line p-5">
                <h3 className="text-[11px] uppercase tracking-eyebrow text-ink-3">{b.heading}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{b.body}</p>
                <div className="mt-4 border-t border-line pt-3">
                  <div className="font-sans text-[clamp(20px,2.2vw,26px)] font-medium tracking-tighter">
                    {b.stat}
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink-3">{b.statLabel}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-5 border-t border-line pt-7 sm:grid-cols-3">
            {c.stats.map((s) => (
              <div key={s.label}>
                <div className="font-sans text-[clamp(24px,3vw,36px)] font-medium tracking-tighter">
                  {s.num}
                </div>
                <div className="mt-1 text-[13px] text-ink-2">{s.label}</div>
                {s.body && <div className="mt-0.5 text-[12px] text-ink-3">{s.body}</div>}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-9 flex flex-col items-start gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
            {/* Plain <a>, not next/link: the URL is already /work/[slug] while the
                modal is open, so a soft nav would be a no-op. A full document load
                renders the standalone page (where @modal resolves to null). */}
            <a
              href={`/work/${c.slug}`}
              className="group inline-flex items-center gap-2 text-[14px] font-medium text-ink transition-colors hover:text-accent-deep"
            >
              Open full page
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <Button href="/#contact" showArrow>
              Consult our Growth Experts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-eyebrow text-ink-3">{label}</dt>
      <dd className="mt-1.5 text-[13.5px] text-ink-2">{value}</dd>
    </div>
  );
}
