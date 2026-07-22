import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ClientMark } from "@/content/clients";

interface WordmarkProps {
  client: ClientMark;
  className?: string;
  /** larger treatment for the /clients page */
  size?: "md" | "lg";
}

/**
 * Bank trust mark. Until licensed vector logos are supplied
 * (TODO: client to confirm), renders a restrained text wordmark — display
 * face, steel at rest, ink on hover — inside a fixed cap-height box so real
 * SVGs can drop into the identical slot later.
 */
export function Wordmark({ client, className, size = "md" }: WordmarkProps) {
  const box = size === "lg" ? "h-12" : "h-8";

  if (client.logo) {
    return (
      <span className={cn("flex items-center", box, className)}>
        <Image
          src={client.logo}
          alt={client.name}
          width={size === "lg" ? 200 : 132}
          height={size === "lg" ? 48 : 32}
          className="h-full w-auto object-contain opacity-70 grayscale transition-opacity duration-ui hover:opacity-100"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex select-none items-center font-display font-semibold tracking-[0.02em] text-ink-3 transition-colors duration-ui hover:text-ink",
        box,
        size === "lg" ? "text-[clamp(1.5rem,2.4vw,2.1rem)]" : "text-[clamp(1.05rem,1.4vw,1.3rem)]",
        className,
      )}
    >
      {client.name}
    </span>
  );
}
