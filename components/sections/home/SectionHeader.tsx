import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import type { SectionHeading } from "@/content/home";

interface SectionHeaderProps {
  meta: SectionHeading;
  className?: string;
  inverse?: boolean;
}

/** Shared section intro: eyebrow, display-2 heading, optional lead, draw-in rule. */
export function SectionHeader({ meta, className, inverse }: SectionHeaderProps) {
  return (
    <Reveal className={cn("max-w-[52rem]", className)}>
      <Eyebrow className={cn(inverse && "!text-steel")}>{meta.eyebrow}</Eyebrow>
      <h2 className={cn("display-2 mt-4", inverse ? "text-ink-inv" : "text-ink")}>
        {meta.heading}
      </h2>
      {meta.lead && (
        <p className={cn("body-lg mt-5 max-w-[56ch]", inverse ? "text-ink-inv-2" : "text-ink-2")}>
          {meta.lead}
        </p>
      )}
      <div className={cn("rule-draw mt-8", inverse && "!bg-line-inv")} aria-hidden="true" />
    </Reveal>
  );
}
