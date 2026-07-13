import { cn } from "@/lib/cn";

interface Props {
  name: string;
  /** Path to a licensed vector logo in /public, or null to render a wordmark. */
  logo: string | null;
  /** Rendered pixel height of the mark; width scales automatically. */
  height?: number;
  className?: string;
}

/**
 * Bank brand mark. Real logos (Axis, IndusInd, HSBC) ship as SVGs in
 * /public/assets/banks and render 1:1 (vectors need no next/image optimisation).
 * When `logo` is null we fall back to a tasteful text wordmark placeholder — the
 * same interim treatment the client trust bar uses (content/clients.ts).
 *
 * TODO: client to confirm — usage rights for the bank marks reproduced here.
 */
export function BankLogo({ name, logo, height = 40, className }: Props) {
  if (!logo) {
    return (
      <span
        className={cn(
          "inline-flex items-center font-sans font-semibold tracking-tight text-ink",
          className,
        )}
        style={{ fontSize: height * 0.6, lineHeight: 1 }}
        aria-label={`${name} (logo pending)`}
      >
        {name}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static first-party SVG; no optimisation needed
    <img
      src={logo}
      alt={`${name} logo`}
      height={height}
      style={{ height, width: "auto" }}
      className={cn("block w-auto object-contain", className)}
    />
  );
}
