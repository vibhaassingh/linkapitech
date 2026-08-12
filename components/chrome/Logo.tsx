import { cn } from "@/lib/cn";

/**
 * LinkAPI Tech lockup — angled double-chevron mark + letterspaced wordmark,
 * drawn in `currentColor` so it inverts cleanly on plum surfaces.
 * TODO: client to confirm — swap in the official vector mark when supplied.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 26 24"
        width="22"
        height="20"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M1.5 21.5 11 2.5h4.4L5.9 21.5H1.5Z" fill="currentColor" />
        <path
          d="M10.6 21.5 20.1 2.5h4.4l-9.5 19h-4.4Z"
          fill="currentColor"
          opacity="0.55"
        />
        <path d="M13.2 9.6h9.6v3.4h-9.6z" fill="currentColor" opacity="0.85" />
      </svg>
      <span className="text-[17px] font-semibold uppercase tracking-[0.045em]">
        LinkAPI&nbsp;Tech
      </span>
    </span>
  );
}
