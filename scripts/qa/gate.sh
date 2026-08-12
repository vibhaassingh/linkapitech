#!/usr/bin/env bash
# Run the full verification gate in dependency order.
#
#   bash scripts/qa/gate.sh [--since <ref>] [--skip-pixdiff]
#
# Every step here encodes a failure this project actually hit:
#
#   • the build is NEVER piped through head/grep — SIGPIPE kills it partway and
#     leaves .next without a BUILD_ID, which then looks like a server bug
#   • BUILD_ID is checked explicitly, because `npm run build` printing
#     "Compiled successfully" does not mean the build finished
#   • every route is probed for 200 BEFORE any sweep runs, because a sweep
#     against a dead server reports zero findings in every category and reads
#     exactly like success
#   • the dev server must not be running: `next dev` and `next start` sharing
#     one .next corrupt each other (routes start returning 500 while / stays 200)
#
# Exits non-zero on the first hard failure. Soft steps (pixdiff review) are
# reported but do not abort.
set -uo pipefail

cd "$(git rev-parse --show-toplevel)"

PORT=3411
BASE="http://localhost:$PORT"
SINCE=""
SKIP_PIXDIFF=0
while [ $# -gt 0 ]; do
  case "$1" in
    --since) SINCE="$2"; shift 2 ;;
    --skip-pixdiff) SKIP_PIXDIFF=1; shift ;;
    *) echo "unknown arg: $1"; exit 64 ;;
  esac
done

ROUTES=(/ /about /services /solutions /connected-banking /industries /contact
        /privacy /terms /banks /banks/axis /banks/indusind /banks/hsbc)

pass=(); fail=(); soft=()
step()  { printf "\n\033[1m▶ %s\033[0m\n" "$1"; }
ok()    { echo "  ✓ $1"; pass+=("$1"); }
bad()   { echo "  ✗ $1"; fail+=("$1"); }
warn()  { echo "  ! $1"; soft+=("$1"); }

cleanup() { [ -n "${SERVER_PID:-}" ] && kill "$SERVER_PID" 2>/dev/null; }
trap cleanup EXIT

# ---------------------------------------------------------------- 1. static
step "typecheck"
if npx tsc --noEmit; then ok "tsc clean"; else bad "tsc errors"; fi

step "contract completeness (defined AND wired)"
if python3 scripts/qa/contract.py; then ok "contract complete"; else bad "contract has orphan/unwired items"; fi

if [ -n "$SINCE" ]; then
  step "ownership audit since $SINCE (--frozen: B0 and shared primitives are locked)"
  if python3 scripts/qa/ownership.py "$SINCE" --frozen; then ok "ownership clean"; else bad "ownership violation"; fi
fi

# ---------------------------------------------------------------- 2. build
step "production build"
if lsof -ti:3000 >/dev/null 2>&1; then
  warn "something is listening on :3000 — a dev server sharing .next will corrupt this build"
fi
rm -rf .next
# NO pipe here, deliberately: SIGPIPE would truncate the build.
if npm run build > /tmp/gate-build.log 2>&1; then
  if [ -f .next/BUILD_ID ]; then
    ok "build complete (BUILD_ID $(cat .next/BUILD_ID))"
  else
    bad "build exited 0 but produced no BUILD_ID — incomplete"; tail -25 /tmp/gate-build.log
  fi
else
  bad "build failed"; tail -30 /tmp/gate-build.log
fi

if [ ${#fail[@]} -gt 0 ]; then
  echo; echo "Aborting before the browser gates — static checks or the build failed."
  printf '  ✗ %s\n' "${fail[@]}"; exit 1
fi

# ---------------------------------------------------------------- 3. serve
step "production server on :$PORT"
lsof -ti:$PORT | xargs kill -9 2>/dev/null
sleep 1
PORT=$PORT npm start > /tmp/gate-server.log 2>&1 &
SERVER_PID=$!
for _ in $(seq 1 40); do
  sleep 1
  curl -sf -o /dev/null "$BASE/" && break
done

step "route health (a sweep against a dead server reports zero findings)"
unhealthy=0
for r in "${ROUTES[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$r")
  bytes=$(curl -s "$BASE$r" | wc -c | tr -d ' ')
  if [ "$code" != "200" ] || [ "$bytes" -lt 5000 ]; then
    echo "    $r -> $code ${bytes}b"; unhealthy=1
  fi
done
if [ $unhealthy -eq 0 ]; then
  ok "all ${#ROUTES[@]} routes serve real content"
else
  bad "some routes unhealthy — refusing to run sweeps on them"
  tail -20 /tmp/gate-server.log; exit 1
fi

# ---------------------------------------------------------------- 4. browser
step "accessibility + layout sweep (13 pages x 4 viewports)"
if node scripts/qa/qa.mjs "$BASE"; then ok "qa sweep clean"; else bad "qa sweep findings"; fi

step "motion integrity (view() tracks scroll, collapses under reduced motion, no jank)"
if node scripts/qa/motion.mjs "$BASE"; then ok "motion clean"; else bad "motion findings"; fi

step "WebGL gating + magnetic"
if node scripts/qa/probe.mjs "$BASE"; then ok "webgl gating clean"; else bad "webgl gating findings"; fi

step "keyboard + mobile menu"
if node scripts/qa/kbd1.mjs; then ok "keyboard clean"; else bad "keyboard findings"; fi

step "reduced motion across pages"
if node scripts/qa/kbd2.mjs; then ok "reduced-motion clean"; else bad "reduced-motion findings"; fi

if [ $SKIP_PIXDIFF -eq 0 ]; then
  step "pixel diff vs baseline (refinement vs redesign)"
  python3 scripts/qa/pixdiff.py --base "$BASE"
  case $? in
    0) ok "every visual change reads as refinement" ;;
    1) warn "some views need human review (strips in scripts/qa/review/)" ;;
    *) bad "a change is large enough to read as a redesign" ;;
  esac
fi

# ---------------------------------------------------------------- 5. summary
echo; echo "================ gate summary ================"
printf '  ✓ %s\n' "${pass[@]}"
[ ${#soft[@]} -gt 0 ] && printf '  ! %s\n' "${soft[@]}"
[ ${#fail[@]} -gt 0 ] && printf '  ✗ %s\n' "${fail[@]}"
echo
if [ ${#fail[@]} -gt 0 ]; then
  echo "GATE FAILED (${#fail[@]} hard failure(s))"; exit 1
fi
echo "GATE PASSED${soft:+ (with items to review)}"
