import { cn } from "@/lib/cn";

interface Props {
  num: string;
  label: string;
  end?: string;
  className?: string;
  /** invert for dark surfaces */
  dark?: boolean;
}

/** Numbered section eyebrow — lime chip + label + hairline rule (DESIGN-SYSTEM §5.8). */
export function SectionEyebrow({ num, label, end, className, dark }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 text-[11px] uppercase tracking-eyebrow",
        dark ? "text-white/60" : "text-ink-2",
        className,
      )}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-pill bg-accent text-[11px] font-semibold text-ink">
        {num}
      </span>
      <span className="shrink-0">{label}</span>
      <span className={cn("h-px flex-1", dark ? "bg-white/15" : "bg-line")} />
      {end && (
        <span className={cn("hidden shrink-0 md:inline", dark ? "text-white/55" : "text-ink-3")}>
          {end}
        </span>
      )}
    </div>
  );
}
