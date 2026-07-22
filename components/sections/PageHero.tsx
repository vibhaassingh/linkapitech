import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
}

/** Shared inner-page hero: eyebrow, display heading, optional lead, hairline. */
export function PageHero({ eyebrow, title, lead, className }: PageHeroProps) {
  return (
    <header className={cn("border-b border-line-soft", className)}>
      <div className="mx-auto w-full max-w-[1240px] px-6 pb-14 pt-[clamp(56px,8vh,96px)] md:px-10">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display-2 mt-5 max-w-[26ch] text-ink">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={160}>
            <p className="body-lg mt-6 max-w-[62ch] text-ink-2">{lead}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
