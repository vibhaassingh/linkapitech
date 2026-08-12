import { cn } from "@/lib/cn";

/**
 * Inline stroke-icon set (24px grid, `currentColor`). Matches the Figma's
 * line-icon language; no icon package is used anywhere in the project.
 */
export type IconName =
  | "chip"
  | "sync"
  | "spark"
  | "doc"
  | "grid"
  | "cart"
  | "unlink"
  | "eye"
  | "shield"
  | "bank"
  | "cash"
  | "card"
  | "plug"
  | "code"
  | "globe"
  | "tag"
  | "chat"
  | "scale"
  | "layers"
  | "building"
  | "link"
  | "receipt"
  | "user"
  | "bolt"
  | "heart"
  | "calendar"
  | "share"
  | "arrows"
  | "chart";

const P: Record<IconName, React.ReactNode> = {
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3" />
    </>
  ),
  sync: (
    <>
      <path d="M20 11a8 8 0 0 0-13.7-5.6L4 7.6" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 13.7 5.6L20 16.4" />
      <path d="M20 20v-4h-4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />
      <path d="M18 16.5 18.8 18.4 20.7 19.2 18.8 20 18 21.9 17.2 20 15.3 19.2 17.2 18.4 18 16.5Z" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 10h16M4 15h16M10 4v16M15 4v16" />
    </>
  ),
  cart: (
    <>
      <path d="M4 5h2l2.4 9.5a1.6 1.6 0 0 0 1.6 1.2h7.2a1.6 1.6 0 0 0 1.6-1.2L20 8H7" />
      <circle cx="10" cy="19.5" r="1.2" />
      <circle cx="18" cy="19.5" r="1.2" />
    </>
  ),
  unlink: (
    <>
      <path d="M9.5 14.5 7.7 16.3a3.8 3.8 0 0 1-5.4-5.4l1.8-1.8" />
      <path d="M14.5 9.5l1.8-1.8a3.8 3.8 0 0 1 5.4 5.4l-1.8 1.8" />
      <path d="M12 3v2.5M3 12h2.5M21 12h-2.5M12 21v-2.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7.5 3v6c0 4.2-3.1 7.6-7.5 9-4.4-1.4-7.5-4.8-7.5-9V6L12 3Z" />
    </>
  ),
  bank: (
    <>
      <path d="M3.5 9.5 12 4.5l8.5 5" />
      <path d="M5.5 9.5v8M9.5 9.5v8M14.5 9.5v8M18.5 9.5v8M3 20h18" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M6 10v4M18 10v4" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19M6 14.5h4" />
    </>
  ),
  plug: (
    <>
      <path d="M14.5 3.5 21 10l-4 4-6.5-6.5 4-4Z" />
      <path d="m10.5 7.5-6 6a3.5 3.5 0 0 0 5 5l6-6" />
      <path d="M3 21l2.5-2.5" />
    </>
  ),
  code: (
    <>
      <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5Z" />
    </>
  ),
  tag: (
    <>
      <path d="M11.5 3.5H20V12l-8.6 8.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L11.5 3.5Z" />
      <circle cx="16.2" cy="7.8" r="1.3" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.5h16v10H9l-5 3.5v-13.5Z" />
      <path d="M8.5 10h7" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M6 20h12M12 6l-6 2 3 5h6l3-5-6-2Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.5 8.5 4.2L12 12 3.5 7.7 12 3.5Z" />
      <path d="m4 12.5 8 4 8-4M4 16.5l8 4 8-4" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M10.5 20.5v-4h3v4" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.4 1.4" />
      <path d="M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.4-1.4" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.5h12v17l-3-1.7-3 1.7-3-1.7-3 1.7v-17Z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" />
    </>
  ),
  bolt: (
    <>
      <path d="M13.5 3 6 13.5h4.5L10 21l7.5-10.5H13l.5-7.5Z" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4c0 5-7.5 9.4-7.5 9.4Z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
    </>
  ),
  share: (
    <>
      <circle cx="17.5" cy="6" r="2.5" />
      <circle cx="6.5" cy="12" r="2.5" />
      <circle cx="17.5" cy="18" r="2.5" />
      <path d="m8.8 10.8 6.4-3.5M8.8 13.2l6.4 3.5" />
    </>
  ),
  arrows: (
    <>
      <path d="M4 9h13l-3-3M20 15H7l3 3" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  className,
  draw,
}: {
  name: IconName;
  size?: number;
  className?: string;
  /**
   * Opt in to the stroke-draw flourish. Emits `data-draw`, which does NOTHING
   * on its own — default rendering is byte-identical. The animation only runs
   * when an ANCESTOR carrying `.icon-draw` is hovered or focused (see
   * globals.css), so the trigger stays with the card/button that owns the
   * interaction. The icon's resting state is always fully drawn, so hover
   * REPLAYS the draw rather than revealing a hidden icon — an icon can never be
   * left invisible for someone who never hovers, or under reduced motion.
   */
  draw?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-draw={draw || undefined}
      className={cn("shrink-0", className)}
    >
      {P[name]}
    </svg>
  );
}
