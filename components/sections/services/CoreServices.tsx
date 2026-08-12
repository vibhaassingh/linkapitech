import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Icon } from "@/components/ui/Icon";
import { SERVICES } from "@/content/services";
import { cn } from "@/lib/cn";

/**
 * Core Services — bento grid. The first two cards span wider (the Figma gives
 * them a full-width row), the rest sit three-up. Featured cards take the
 * lavender tint; the others stay white.
 */
export function CoreServices() {
  const [a, b, ...rest] = SERVICES;

  return (
    <section id="core-services" className="section-pad bg-canvas">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">Core Services</h2>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2" step={90}>
          <Card service={a} wide />
          <Card service={b} wide />
        </RevealGroup>

        <RevealGroup className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" step={80}>
          {rest.map((s) => (
            <Card key={s.id} service={s} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function Card({ service, wide }: { service: (typeof SERVICES)[number]; wide?: boolean }) {
  return (
    <article
      id={service.id}
      className={cn(
        "flex h-full flex-col rounded-xl border p-7 shadow-card md:p-8",
        service.feature ? "border-lavender-300 bg-tint" : "border-line-soft bg-surface",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-[30px] font-bold leading-none text-violet-text">{service.num}</span>
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-md",
            service.feature ? "bg-lavender-200 text-violet-text" : "bg-tint text-violet-text",
          )}
        >
          <Icon name={service.icon} size={18} />
        </span>
      </div>

      <h3 className={cn("mt-6 font-semibold text-ink", wide ? "text-[19px]" : "text-[17px]")}>
        {service.title}
      </h3>
      <p className="mt-2.5 max-w-[52ch] text-[14.5px] leading-relaxed text-ink-2">
        {service.description}
      </p>
    </article>
  );
}
