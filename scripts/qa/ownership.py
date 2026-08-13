#!/usr/bin/env python3
"""Audit which packet touched which file, against the declared ownership map.

    python3 scripts/qa/ownership.py <since-ref> [--until <ref>] [--frozen]

`--frozen` asserts that no B0-owned or shared-primitive file changed in the
range. It is only meaningful over the FLEET PHASE window, so pass --until to end
the range at the fleet commit:

    python3 scripts/qa/ownership.py <b0-commit> --until <fleet-commit> --frozen

Without --until the range runs to the working tree, which flags the
orchestrator's own later fixes to B0 files (e.g. the AA and reduced-motion
corrections the fleet escalated). Those are legitimate; a section agent doing it
mid-phase is not, and that is what this catches.

The elevation runs seven section agents in parallel. They are collision-free
only because every file has exactly ONE owner, which is an assumption worth
checking rather than trusting: two agents editing one file silently produces a
last-write-wins mess that still typechecks and still builds.

Reports, for the diff since <since-ref>:
  • files changed that no packet owns          (unowned — decide deliberately)
  • files owned by a packet that must not be edited after its phase (globals
    after B0) — these are contract violations
Exit 1 if any violation is found.
"""
import subprocess
import sys
from fnmatch import fnmatch

# One owner per pattern. Order matters: first match wins, so put specific
# component paths before the broad page globs.
OWNERSHIP = [
    # --- B0: the foundation. READ-ONLY to every later packet. ---
    ("B0", "app/globals.css"),
    ("B0", "tailwind.config.ts"),
    ("B0", "lib/springs.ts"),
    ("B0", "components/motion/*"),
    ("B0", "components/ui/StatNumber.tsx"),
    ("B0", "components/ui/Icon.tsx"),
    ("B0", "components/ui/Button.tsx"),

    # --- S1 hero ---
    ("S1", "components/sections/home/Hero.tsx"),
    ("S1", "components/three/*"),

    # --- S2 home-mid ---
    ("S2", "components/sections/home/WhoWeAre.tsx"),
    ("S2", "components/sections/home/WhatWeDo.tsx"),
    ("S2", "components/sections/home/Ecosystem.tsx"),
    ("S2", "components/sections/home/LogoMarquee.tsx"),
    ("S2", "components/sections/home/StatBand.tsx"),
    ("S2", "components/sections/home/ErpBand.tsx"),

    # --- S3 home-tail ---
    ("S3", "components/sections/home/Challenges.tsx"),
    ("S3", "components/sections/home/ProcessRail.tsx"),
    ("S3", "components/sections/home/Terminal.tsx"),
    ("S3", "components/sections/home/Testimonials.tsx"),
    ("S3", "components/sections/home/HomeFaq.tsx"),
    ("S3", "components/sections/home/WhyUs.tsx"),
    ("S3", "components/sections/CtaBand.tsx"),

    # --- S4 chrome ---
    ("S4", "components/chrome/*"),
    ("S4", "components/chrome/chrome.css"),
    ("S4", "app/(marketing)/layout.tsx"),
    ("S4", "app/(site)/layout.tsx"),
    ("S4", "app/layout.tsx"),
    ("S4", "next.config.ts"),

    # --- S5 services ---
    ("S5", "app/(site)/services/*"),
    ("S5", "components/sections/services/*"),

    # --- S6 connected-banking + solutions ---
    ("S6", "app/(site)/connected-banking/*"),
    ("S6", "app/(site)/solutions/*"),

    # --- S7 remaining pages + forms ---
    ("S7", "app/(site)/about/*"),
    ("S7", "app/(site)/industries/*"),
    ("S7", "app/(site)/contact/*"),
    ("S7", "app/(site)/banks/*"),
    ("S7", "app/(site)/privacy/*"),
    ("S7", "app/(site)/terms/*"),
    ("S7", "components/sections/PageHero.tsx"),
    ("S7", "components/sections/LegalDoc.tsx"),
    ("S7", "components/sections/ContactForm.tsx"),
    ("S7", "components/sections/industries/*"),
    ("S7", "components/ui/Field.tsx"),

    # --- shared primitives: FROZEN. Rendered by sections in several different
    #     packets, so no section agent may edit them; a change here is the
    #     orchestrator's call. Testing the map against the tree is what caught
    #     these two as latent S2/S3 collision points. ---
    ("FROZEN", "components/sections/home/SectionHeader.tsx"),
    ("FROZEN", "components/ui/Eyebrow.tsx"),

    # --- orchestrator-owned (not a packet) ---
    ("ORCH", "scripts/qa/*"),
    ("ORCH", "content/*"),
    ("ORCH", "lib/*"),
    ("ORCH", "*.md"),
    ("ORCH", "package.json"),
    ("ORCH", ".gitignore"),
    ("ORCH", "app/sitemap.ts"),
    ("ORCH", "app/robots.ts"),
    ("ORCH", "app/icon.tsx"),
    ("ORCH", "app/apple-icon.tsx"),
    ("ORCH", "app/opengraph-image.tsx"),
    ("ORCH", "app/api/*"),
    ("ORCH", "app/fonts.ts"),
    ("ORCH", "tsconfig.json"),
    ("ORCH", ".eslintrc.json"),
    ("ORCH", "package-lock.json"),
    ("ORCH", ".claude/*"),
    ("ORCH", "app/(marketing)/page.tsx"),
]

# Packets whose files are frozen once their phase has landed.
FROZEN_AFTER_PHASE = {"B0", "FROZEN"}


def owner_of(path: str):
    for packet, pattern in OWNERSHIP:
        if fnmatch(path, pattern) or path == pattern:
            return packet
    return None


def main():
    frozen = "--frozen" in sys.argv
    until = None
    argv = sys.argv[1:]
    if "--until" in argv:
        i = argv.index("--until")
        until = argv[i + 1] if i + 1 < len(argv) else None
        del argv[i:i + 2]
    positional = [a for a in argv if not a.startswith("--")]
    since = positional[0] if positional else "HEAD~1"

    rng = [since] if until is None else [f"{since}..{until}"]
    changed = subprocess.run(
        ["git", "diff", "--name-only", *rng],
        capture_output=True, text=True, check=True,
    ).stdout.split()
    if frozen and until is None:
        print("NOTE: --frozen without --until measures to the working tree, so the\n"
              "      orchestrator's own post-phase fixes to B0 files will be flagged.\n")
    if not changed:
        print(f"No files changed since {since}.")
        return 0

    by_packet, unowned = {}, []
    for path in changed:
        packet = owner_of(path)
        if packet is None:
            unowned.append(path)
        else:
            by_packet.setdefault(packet, []).append(path)

    print(f"=== ownership audit since {since} ({len(changed)} files) ===")
    for packet in sorted(by_packet):
        print(f"\n  {packet}  ({len(by_packet[packet])} files)")
        for path in sorted(by_packet[packet]):
            print(f"    {path}")

    violations = []
    if unowned:
        print(f"\n  UNOWNED ({len(unowned)} files) — no packet claims these:")
        for path in sorted(unowned):
            print(f"    {path}")
        violations.append(f"{len(unowned)} unowned file(s)")

    if frozen:
        for packet in FROZEN_AFTER_PHASE:
            if packet in by_packet:
                print(f"\n  CONTRACT VIOLATION — {packet} files edited after its phase landed:")
                for path in sorted(by_packet[packet]):
                    print(f"    {path}")
                violations.append(f"{packet} files edited post-phase")

    if violations:
        print("\nFAIL: " + "; ".join(violations))
        return 1
    print("\nOK — every changed file has exactly one declared owner.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
