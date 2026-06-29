#!/usr/bin/env bash
# Conductor "Run": start both packages of the monorepo together.
#   - API (packages/api): cargo run — loads packages/api/.env, runs migrations,
#     binds API_BASE_URL (e.g. 0.0.0.0:8000)
#   - Web (packages/frontend): Next.js dev server on port 8080
# Both children share this script's process group; the trap tears them all
# down when Conductor stops the run (SIGHUP) so nothing is left orphaned.
set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
	trap - EXIT INT TERM HUP
	kill 0 2>/dev/null
}
trap cleanup EXIT INT TERM HUP

( cd "$root/packages/api" && exec cargo run ) &
( cd "$root/packages/frontend" && exec bun run dev ) &

wait
