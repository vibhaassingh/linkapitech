import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import type { SectionHeading } from "@/content/home";

interface SectionHeaderProps {
  meta: SectionHeading;
  className?: string;
  /** on plum surfaces */
  inverse?: boolean;
  align?: "left" | "center";
}

/**
 * Shared section intro: optional capsule eyebrow, display-2 heading, lead.
 * The Figma centres most section headings and left-aligns a few, so both.
 */
export function SectionHeader({
  meta,
  className,
  inverse,
  align = "left",
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <Reveal
      className={cn(
        centered ? "mx-auto max-w-[44rem] text-center" : "max-w-[52rem]",
        className,
      )}
    >
      {meta.eyebrow && (
        <span className="eyebrow-capsule mb-6 inline-flex">{meta.eyebrow}</span>
      )}
      <h2 className={cn("display-2", inverse ? "text-ink-inv" : "text-ink")}>
        {meta.heading}
      </h2>
      {meta.lead && (
        <p
          className={cn(
            "mt-4 max-w-[62ch] text-[16px] leading-relaxed",
            inverse ? "text-ink-inv-2" : "text-ink-2",
            centered && "mx-auto",
          )}
        >
          {meta.lead}
        </p>
      )}
    </Reveal>
  );
}
