import { cn } from "@/lib/cn";
import type { ClientMark } from "@/content/clients";

interface WordmarkProps {
  client: ClientMark;
  className?: string;
  /** larger treatment for the /clients page */
  size?: "md" | "lg";
}

/**
 * Bank trust mark. The source logos are white-on-transparent PNGs, so they are
 * painted as CSS masks in `currentColor` — the real logo shapes rendered in
 * institutional steel, going full navy on hover. Marks without artwork fall
 * back to a text wordmark in the display face.
 */
export function Wordmark({ client, className, size = "md" }: WordmarkProps) {
  const height = (size === "lg" ? 44 : 30) * (client.scale ?? 1);

  if (client.logo) {
    return (
      <span
        role="img"
        aria-label={client.name}
        className={cn(
          "block bg-steel transition-colors duration-ui hover:bg-navy-900",
          className,
        )}
        style={{
          height,
          width: height * (client.ratio ?? 3),
          WebkitMaskImage: `url(${client.logo})`,
          maskImage: `url(${client.logo})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex select-none items-center font-display font-semibold tracking-[0.02em] text-ink-3 transition-colors duration-ui hover:text-ink",
        size === "lg" ? "text-[clamp(1.5rem,2.4vw,2.1rem)]" : "text-[clamp(1.05rem,1.4vw,1.3rem)]",
        className,
      )}
      style={{ height }}
    >
      {client.name}
    </span>
  );
}
