import type { CSSProperties } from "react";
import { PROCESS_SAMPLE, type TermLine } from "@/content/process";

interface TerminalProps {
  method?: string;
  path?: string;
  /** Plain caption instead of METHOD + path (used by the NBFC stack card). */
  title?: string;
  lines?: TermLine[];
  className?: string;
  /**
   * Opt in to the scroll-linked reveal: lines type in across the host
   * section's progress instead of firing one staggered burst on intersection,
   * and the last line gains a caret. OFF by default, so /solutions and
   * /industries keep the exact behaviour they have today — see the reveal note
   * below for why this cannot be inferred from `--sp` alone.
   */
  progress?: boolean;
}

/**
 * SOFTENED SYNTAX PALETTE, declared here rather than in globals.css.
 *
 * Same hues, lower chroma — the previous set read as a default editor theme
 * rather than as part of this design. Measured contrast on `--terminal`
 * (#171b21), all comfortably over the 4.5:1 floor:
 *
 *   --t-key   #93b8dd   8.35:1   (was #7fb4e8, 7.90:1)
 *   --t-str   #8ec69f   8.83:1   (was #7ed492, 9.64:1)
 *   --t-num   #d8bd8c   9.53:1   (was #e8c57f, 10.47:1)
 *   --t-punct #bcc5d0   9.90:1   (was #c4cbd4, 10.57:1)  braces, colons
 *   --t-cmt   → --terminal-cmt   5.58:1   DELIBERATELY UNTOUCHED
 *
 * `--t-cmt` is an alias, not a new value: the comment colour was corrected to
 * 5.58:1 after an AA failure and must not be re-derived here. Softening it
 * further is the one change this palette must never make.
 *
 * The values live on the element because globals.css's `.terminal .t-key`
 * rules are (0,2,0) and would outrank any utility — so the `t-key`/`t-str`/
 * `t-num`/`t-cmt` classes are dropped from the spans and the colour comes from
 * these custom properties instead. (Those four rules in globals.css are now
 * unused; B0 owns removing them or re-pointing them at these vars.)
 */
const SYNTAX: CSSProperties = {
  "--t-key": "#93b8dd",
  "--t-str": "#8ec69f",
  "--t-num": "#d8bd8c",
  "--t-punct": "#bcc5d0",
  "--t-cmt": "var(--terminal-cmt)",
  color: "var(--t-punct)",
} as CSSProperties;

/** Sub-range of the host section's transit that the lines type across. */
const TYPE_FROM = 0.18;
const TYPE_TO = 0.58;

/**
 * Per-line reveal, driven entirely by CSS off the host section's progress.
 *
 * `--lp` is this line's own 0→1 progress, derived from `--sp-live` with a
 * clamp; opacity reads it directly and the 4px rise is `(1 - --lp)`, so the
 * whole thing is transform + opacity and there is no layout involved at any
 * point in the range.
 *
 * WHY `--sp-live` AND NOT `--sp`: globals.css declares `--sp: 0` on `:root`,
 * so `var(--sp, 1)` can never fall back — with no JS, on a page whose section
 * does not track progress, or under reduced motion (where the writer is a
 * no-op), `--sp` reads 0 and every line would sit at opacity 0. `--sp-live` is
 * written ONLY by a running progress writer, so an unwritten value means
 * "nobody is driving this" and the fallback of 1 shows every line. Fail-open
 * is the only acceptable default for content.
 */
function lineStyle(i: number, count: number): CSSProperties {
  const step = (TYPE_TO - TYPE_FROM) / Math.max(1, count);
  const from = (TYPE_FROM + i * step).toFixed(4);
  // 1.8 × the step, so consecutive lines overlap and it reads as typing
  // rather than as a queue of separate fades.
  const span = (step * 1.8).toFixed(4);
  return {
    "--lp": `clamp(0, calc((var(--sp-live, 1) - ${from}) / ${span}), 1)`,
    opacity: "var(--lp)",
    transform: "translateY(calc((1 - var(--lp)) * 4px))",
    // Kills the 400ms transition globals.css puts on `[data-tline]`: a
    // transition on a value that is already re-derived every frame only adds
    // lag behind the scroll.
    transition: "none",
  } as CSSProperties;
}

/**
 * Code window. A real <pre> of DOM text (not an image), so it stays crisp and
 * selectable. Defaults to the delivery sample.
 *
 * Reveal has two modes:
 *  - default — `data-tline` + the `[data-inview]` stagger in globals.css, one
 *    burst when the block scrolls in. Unchanged; this is what the inner pages
 *    use.
 *  - `progress` — scroll-linked typing (see `lineStyle`), synchronised with
 *    whatever else the host section drives off the same `--sp-live`.
 *
 * REDUCED MOTION: the default mode is flattened by the
 * `.terminal [data-tline]` rule in globals.css's reduced-motion block; the
 * progress mode has no JS of its own and fails open to fully-revealed the
 * moment nothing writes `--sp-live` (which is exactly what a reduced-motion
 * progress writer does). The caret is Tailwind's `ping` keyframe, which the
 * same block freezes at its base state — a solid, unblinking caret.
 */
export function Terminal({
  method,
  path,
  title,
  lines,
  className,
  progress = false,
}: TerminalProps) {
  const rows = lines ?? PROCESS_SAMPLE.lines;
  const caption =
    title ??
    `${method ?? PROCESS_SAMPLE.method} ${path ?? PROCESS_SAMPLE.path}`;

  return (
    <div
      style={SYNTAX}
      className={`terminal group relative min-w-0 overflow-hidden ${className ?? ""}`}
    >
      {/*
        Wet top edge, matching `.glass::after`'s 170° highlight so the code
        window sits in the same material vocabulary as the glass cards. It is a
        real element rather than a pseudo (globals.css is not ours), placed
        first and left un-positioned-above so the `relative` content below
        paints over it — a veil across the code would cost contrast.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(170deg,rgba(255,255,255,0.14),transparent_24%)]"
      />

      <div className="relative flex items-center gap-2 border-b border-veil-1 px-4 py-3">
        {/* Traffic lights brighten together on hover — the window feels live
            without any of them becoming a control. */}
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span
            key={c}
            style={{ backgroundColor: c }}
            className="h-[10px] w-[10px] rounded-pill brightness-100 transition-[filter] duration-ui group-hover:brightness-125"
            aria-hidden="true"
          />
        ))}
        <span className="ml-3 truncate text-[12px] text-[#8d97a3]">
          {caption}
        </span>
      </div>

      {/* `tnum` locks the figures to one advance width so nested numeric
          values stay in column with each other. */}
      <pre className="relative overflow-x-auto px-5 py-5">
        <code className="tnum">
          {rows.map((l, i) => (
            <span
              key={i}
              /* Kept in BOTH modes: it is the hook the reduced-motion block in
                 globals.css uses to force every line visible — belt to the
                 fail-open braces in `lineStyle`. */
              data-tline=""
              className="block"
              style={
                progress
                  ? lineStyle(i, rows.length)
                  : ({ ["--tline" as string]: i } as CSSProperties)
              }
            >
              {l.t === "cmt" && (
                <span className="[color:var(--t-cmt)]">{l.text}</span>
              )}
              {l.t === "raw" && <span>{l.text || " "}</span>}
              {l.t === "ok" && (
                <span className="[color:var(--t-str)]">{l.text}</span>
              )}
              {l.t === "open" && (
                <span>
                  {"  "}
                  <span className="[color:var(--t-key)]">
                    &quot;{l.key}&quot;
                  </span>
                  : {"{"}
                </span>
              )}
              {l.t === "kv" && (
                <span>
                  {l.indent ? "    " : "  "}
                  <span className="[color:var(--t-key)]">
                    &quot;{l.key}&quot;
                  </span>
                  :{" "}
                  <span
                    className={
                      l.kind === "num"
                        ? "[color:var(--t-num)]"
                        : "[color:var(--t-str)]"
                    }
                  >
                    {l.value}
                  </span>
                  {l.last ? "" : ","}
                </span>
              )}
              {progress && i === rows.length - 1 && <Caret />}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/**
 * Composer caret. Tailwind's `ping` keyframe is reused deliberately — the
 * `animate-ping` class is what makes the browser emit `@keyframes ping` at all,
 * so the animation has to be named through the class and then retimed. With
 * `steps(1,end)` the keyframe stops interpolating and holds each value for its
 * whole interval, which turns ping into a true on/off blink: solid for 825ms,
 * gone for 275ms, 1.1s period. (Contract gap: there is no `blink` keyframe in
 * the motion vocabulary yet — see the report.)
 */
function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-1 inline-block h-[0.95em] w-[2px] translate-y-[2px] animate-ping rounded-pill bg-ink-inv-3 [animation-duration:1100ms] [animation-timing-function:steps(1,end)]"
    />
  );
}
