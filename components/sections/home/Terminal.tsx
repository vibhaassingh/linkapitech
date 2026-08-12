import { PROCESS_SAMPLE, type TermLine } from "@/content/process";

interface TerminalProps {
  method?: string;
  path?: string;
  /** Plain caption instead of METHOD + path (used by the NBFC stack card). */
  title?: string;
  lines?: TermLine[];
  className?: string;
}

/**
 * Code window. A real <pre> of DOM text (not an image), so it stays crisp and
 * selectable; lines fade in staggered once the block scrolls into view, and the
 * global reduced-motion rule snaps them on. Defaults to the delivery sample.
 */
export function Terminal({ method, path, title, lines, className }: TerminalProps) {
  const rows = lines ?? PROCESS_SAMPLE.lines;
  const caption = title ?? `${method ?? PROCESS_SAMPLE.method} ${path ?? PROCESS_SAMPLE.path}`;

  return (
    <div className={`terminal overflow-hidden ${className ?? ""}`}>
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
        <span className="h-[10px] w-[10px] rounded-pill bg-[#ff5f57]" aria-hidden="true" />
        <span className="h-[10px] w-[10px] rounded-pill bg-[#febc2e]" aria-hidden="true" />
        <span className="h-[10px] w-[10px] rounded-pill bg-[#28c840]" aria-hidden="true" />
        <span className="ml-3 truncate text-[12px] text-[#8d97a3]">{caption}</span>
      </div>

      <pre className="overflow-x-auto px-5 py-5">
        <code>
          {rows.map((l, i) => (
            <span key={i} data-tline="" className="block" style={{ ["--tline" as string]: i }}>
              {l.t === "cmt" && <span className="t-cmt">{l.text}</span>}
              {l.t === "raw" && <span>{l.text || " "}</span>}
              {l.t === "ok" && <span className="t-str">{l.text}</span>}
              {l.t === "open" && (
                <span>
                  {"  "}
                  <span className="t-key">&quot;{l.key}&quot;</span>: {"{"}
                </span>
              )}
              {l.t === "kv" && (
                <span>
                  {l.indent ? "    " : "  "}
                  <span className="t-key">&quot;{l.key}&quot;</span>:{" "}
                  <span className={l.kind === "num" ? "t-num" : "t-str"}>{l.value}</span>
                  {l.last ? "" : ","}
                </span>
              )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
