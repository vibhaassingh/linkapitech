import { PROCESS_SAMPLE } from "@/content/process";

/**
 * Code window shown beside the delivery steps. A real <pre> of DOM text (not an
 * image), so it stays crisp and selectable; lines fade in staggered once the
 * block scrolls into view, and the global reduced-motion rule snaps them on.
 */
export function Terminal() {
  const { method, path, lines } = PROCESS_SAMPLE;

  return (
    <div className="terminal overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
        <span className="h-[10px] w-[10px] rounded-pill bg-[#ff5f57]" aria-hidden="true" />
        <span className="h-[10px] w-[10px] rounded-pill bg-[#febc2e]" aria-hidden="true" />
        <span className="h-[10px] w-[10px] rounded-pill bg-[#28c840]" aria-hidden="true" />
        <span className="ml-3 text-[12px] text-[#8d97a3]">
          {method} {path}
        </span>
      </div>

      <pre className="overflow-x-auto px-5 py-5">
        <code>
          {lines.map((l, i) => (
            <span key={i} data-tline="" className="block" style={{ ["--tline" as string]: i }}>
              {l.t === "cmt" && <span className="t-cmt">{l.text}</span>}
              {l.t === "raw" && <span>{l.text}</span>}
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
