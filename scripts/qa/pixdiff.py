#!/usr/bin/env python3
"""Pixel-diff current pages against scripts/qa/baseline/.

    python3 scripts/qa/pixdiff.py [--base http://localhost:3411] [--only home,about]

The elevation's contract is "same design, finer" — so this exists to make every
visual change *explainable* rather than to demand zero change. It classifies
each page/viewport and writes review strips for anything non-trivial.

Classification:
  identical   no differing pixel
  refinement  < 0.8% of pixels differ AND page height unchanged (±2px)
              — texture, shadow, sub-pixel spacing: what this pass is allowed
                to do
  review      0.8%–6% differ, or height moved by 3–40px
              — writes a side-by-side strip; a human decides
  REDESIGN    > 6% differ, or height moved > 40px
              — treated as a failure: this pass must not restructure layout

Exit codes: 0 all identical/refinement · 1 something needs review · 2 REDESIGN.
Requires Pillow (already used by the QA tooling) and a running production server.
"""
import argparse
import os
import subprocess
import sys

try:
    from PIL import Image, ImageChops
except ImportError:
    sys.exit("Pillow is required: python3 -m pip install pillow")

Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASELINE = os.path.join(ROOT, "scripts", "qa", "baseline")
CURRENT = os.path.join(ROOT, "scripts", "qa", "current")
REVIEW = os.path.join(ROOT, "scripts", "qa", "review")

ROUTES = [
    "/", "/about", "/services", "/solutions", "/connected-banking",
    "/industries", "/contact", "/privacy", "/terms",
    "/banks", "/banks/axis", "/banks/indusind", "/banks/hsbc",
]
WIDTHS = (1440, 390)

# Thresholds — deliberately explicit so a judgement call is reviewable.
REFINE_PCT, REVIEW_PCT = 0.8, 6.0
REFINE_DH, REVIEW_DH = 2, 40
CHANNEL_TOL = 12  # per-pixel channel delta below this is noise, not a change


def slug(route: str) -> str:
    return "home" if route == "/" else route.lstrip("/").replace("/", "-")


def capture(base_url: str, routes) -> bool:
    os.makedirs(CURRENT, exist_ok=True)
    ok = True
    for route in routes:
        for w in WIDTHS:
            out = os.path.join(CURRENT, f"{slug(route)}-{w}.png")
            proc = subprocess.run(
                ["node", os.path.join(ROOT, "scripts", "qa", "shot.mjs"),
                 base_url + route, out, str(w), "rm"],
                capture_output=True, text=True, cwd=ROOT,
            )
            tail = (proc.stdout or proc.stderr or "").strip().splitlines()
            line = tail[-1] if tail else ""
            # A page that failed to render still yields a file, so validate the
            # captured height rather than trusting the exit code.
            height = 0
            if "x" in line:
                try:
                    height = int(line.rsplit("x", 1)[1])
                except ValueError:
                    height = 0
            if height < 1200:
                print(f"  CAPTURE FAILED {slug(route)}-{w}: {line!r}")
                ok = False
    return ok


def best_aligned_diff(a: Image.Image, b: Image.Image, search=48):
    """Diff after compensating for a uniform vertical shift.

    A raw pixel diff cannot tell "the page moved down 14px" from "the page was
    redesigned": text is thin and high-contrast, so a small uniform translation
    makes nearly every text pixel differ. Three separate hypotheses about a
    ~8% diff (border-radius keyframes, var() in keyframes, text-wrap) were all
    falsified before the real answer turned out to be translation. So search a
    small offset window and report the best alignment — what is left after that
    is genuine change.
    """
    w = min(a.width, b.width)
    h = min(a.height, b.height) - search
    if h <= 0:
        return None, 0
    best, best_dy = None, 0
    for dy in range(-search, search + 1, 2):
        ac = a.crop((0, search, w, search + h))
        bc = b.crop((0, search + dy, w, search + dy + h))
        diff = ImageChops.difference(ac, bc).convert("L")
        changed = sum(diff.point(lambda p: 255 if p > CHANNEL_TOL else 0).histogram()[1:])
        pct = 100.0 * changed / (w * h)
        if best is None or pct < best:
            best, best_dy = pct, dy
    return best, best_dy


def compare(name: str):
    a_path = os.path.join(BASELINE, name)
    b_path = os.path.join(CURRENT, name)
    if not os.path.exists(a_path):
        return ("missing-baseline", 0.0, 0, None, 0.0, 0)
    if not os.path.exists(b_path):
        return ("missing-current", 0.0, 0, None, 0.0, 0)

    a = Image.open(a_path).convert("RGB")
    b = Image.open(b_path).convert("RGB")
    dh = b.height - a.height

    # Compare the overlapping region so a height change doesn't mask pixel work.
    h = min(a.height, b.height)
    w = min(a.width, b.width)
    ac, bc = a.crop((0, 0, w, h)), b.crop((0, 0, w, h))
    diff = ImageChops.difference(ac, bc)
    bbox = diff.getbbox()
    if bbox is None and dh == 0:
        return ("identical", 0.0, 0, None, 0.0, 0)

    # Count pixels whose summed channel delta clears the noise floor.
    gray = diff.convert("L").point(lambda p: 255 if p > CHANNEL_TOL else 0)
    changed = sum(gray.histogram()[1:])
    pct = 100.0 * changed / (w * h)

    # Score on the shift-compensated diff; the raw number is kept for context.
    aligned, dy = best_aligned_diff(a, b)
    score = aligned if aligned is not None else pct

    if abs(dh) > REVIEW_DH or score > REVIEW_PCT:
        verdict = "REDESIGN"
    elif abs(dh) > REFINE_DH or score > REFINE_PCT:
        verdict = "review"
    else:
        verdict = "refinement"
    return (verdict, score, dh, (a, b, bbox), pct, dy)


def write_strip(name: str, a: Image.Image, b: Image.Image, bbox):
    """Side-by-side crop around the busiest changed band, for eyeballing."""
    os.makedirs(REVIEW, exist_ok=True)
    top = max(0, (bbox[1] if bbox else 0) - 80)
    bot = min(min(a.height, b.height), (bbox[3] if bbox else 600) + 80)
    bot = min(bot, top + 1400)  # cap so the strip stays viewable
    ca, cb = a.crop((0, top, a.width, bot)), b.crop((0, top, b.width, bot))
    gap = 24
    sheet = Image.new("RGB", (ca.width + cb.width + gap, max(ca.height, cb.height)), (235, 232, 238))
    sheet.paste(ca, (0, 0))
    sheet.paste(cb, (ca.width + gap, 0))
    target_w = 2200
    if sheet.width > target_w:
        sheet = sheet.resize((target_w, int(sheet.height * target_w / sheet.width)), Image.LANCZOS)
    out = os.path.join(REVIEW, name.replace(".png", "") + "-baseline-vs-current.png")
    sheet.save(out)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://localhost:3411")
    ap.add_argument("--only", default="", help="comma-separated slugs to limit to")
    ap.add_argument("--no-capture", action="store_true", help="reuse scripts/qa/current")
    args = ap.parse_args()

    if not os.path.isdir(BASELINE) or not os.listdir(BASELINE):
        sys.exit("No baselines in scripts/qa/baseline — capture them before changing anything.")

    routes = ROUTES
    if args.only:
        wanted = {s.strip() for s in args.only.split(",")}
        routes = [r for r in ROUTES if slug(r) in wanted]

    if not args.no_capture:
        print(f"capturing {len(routes)} routes x {len(WIDTHS)} widths from {args.base} …")
        if not capture(args.base, routes):
            sys.exit("ABORT: some captures failed to render — is a production server up?")

    rows, worst = [], 0
    for route in routes:
        for w in WIDTHS:
            name = f"{slug(route)}-{w}.png"
            verdict, pct, dh, imgs, raw, dy = compare(name)
            strip = None
            if verdict in ("review", "REDESIGN") and imgs:
                strip = write_strip(name, imgs[0], imgs[1], imgs[2])
            rows.append((name, verdict, pct, dh, strip, raw, dy))
            worst = max(worst, {"identical": 0, "refinement": 0, "review": 1,
                                "REDESIGN": 2, "missing-baseline": 1,
                                "missing-current": 1}[verdict])

    order = {"REDESIGN": 0, "review": 1, "missing-baseline": 2, "missing-current": 2,
             "refinement": 3, "identical": 4}
    rows.sort(key=lambda r: (order[r[1]], -r[2]))

    print(f"\n=== pixel diff vs baseline ({len(rows)} captures) ===")
    for name, verdict, pct, dh, strip, raw, dy in rows:
        note = f"{pct:5.2f}% aligned (raw {raw:5.2f}%, shift {dy:+d}px)"
        if dh:
            note += f"  height {dh:+d}px"
        print(f"  {verdict:16s} {name:34s} {note}")
        if strip:
            print(f"      review strip: {os.path.relpath(strip, ROOT)}")

    counts = {}
    for _, v, *_ in rows:
        counts[v] = counts.get(v, 0) + 1
    print("\n " + "  ".join(f"{k}={v}" for k, v in sorted(counts.items())))
    print({0: "\nOK — every change reads as refinement.",
           1: "\nSOME CHANGES NEED HUMAN REVIEW (see strips above).",
           2: "\nFAIL — a change is large enough to read as a redesign."}[worst])
    sys.exit(worst)


if __name__ == "__main__":
    main()
