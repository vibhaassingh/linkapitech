import { CONTACT } from "@/lib/site";

/** Reusable real contact block (CONTENT-MAPPING §2.5) — home + contact page. */
export function ContactDetails() {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <span className="text-[11px] uppercase tracking-eyebrow text-ink-3">Our location</span>
        <p className="mt-1.5 text-[15px] text-ink-2">
          {CONTACT.address.line1}
          <br />
          {CONTACT.address.line2}
        </p>
      </div>

      {CONTACT.channels.map((c) => (
        <div key={c.phone}>
          <span className="text-[11px] uppercase tracking-eyebrow text-ink-3">{c.label}</span>
          <p className="mt-1.5 flex flex-col text-[15px]">
            <a href={c.phoneHref} className="text-ink transition-colors hover:text-accent-deep">
              {c.phone}
            </a>
            <a
              href={`mailto:${c.email}`}
              className="text-ink-2 transition-colors hover:text-accent-deep"
            >
              {c.email}
            </a>
          </p>
        </div>
      ))}

      <a
        href={CONTACT.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-2 rounded-pill border border-line px-4 py-2 text-[13px] text-ink transition-all hover:-translate-y-0.5 hover:border-ink"
      >
        <span className="pulse-dot" />
        Chat on WhatsApp
      </a>
    </div>
  );
}
