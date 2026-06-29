#!/usr/bin/env bash
# Conductor workspace setup: install dependencies for both packages.
# Runs once when a workspace is created. Building doesn't need env/DB.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Keep the repo root checkout current (best-effort; never fail setup on this).
if [ -n "${CONDUCTOR_ROOT_PATH:-}" ]; then
	git -C "$CONDUCTOR_ROOT_PATH" fetch --prune origin \
		&& git -C "$CONDUCTOR_ROOT_PATH" pull --ff-only || true
fi

# Frontend: install JS deps with Bun.
( cd "$root/packages/frontend" && bun install )

# API: fetch + compile Rust deps so the Run button starts fast.
( cd "$root/packages/api" && cargo build )
