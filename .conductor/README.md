# Conductor config

Setup for running this monorepo in [Conductor](https://conductor.build).

## What's here

- `settings.toml` — shared repository config (committed).
- `setup.sh` — runs once per new workspace; installs deps for both packages.
- `run.sh` — the Run button; starts the API and frontend together.

## Prerequisites (one-time, on your machine)

- **Bun** (frontend) and the **Rust toolchain / cargo** (API) on your `PATH`.
- The gitignored local env files must exist in your **repo root checkout** so
  Conductor can copy them into each new workspace:
  - `packages/api/.env` — `DB_URL`, `API_BASE_URL`, AWS, `PUSHSAFER_KEY`,
    `GEMINI_API_KEY`, `GEMINI_BASE_URL`
  - `packages/frontend/.env.local` — `NEXT_PUBLIC_API_BASE_URL`,
    `OCTOPUS_API_KEY`

  These hold secrets and are never committed, so they only reach new
  workspaces via Conductor's "Files to copy" (`file_include_globs`).

## What happens

- **On workspace create** (`setup.sh`): `bun install` in the frontend and
  `cargo build` in the API (so the first Run isn't a cold compile). Also
  fast-forwards the root checkout.
- **On Run** (`run.sh`): starts both servers — API via `cargo run` (runs
  migrations on boot, binds `API_BASE_URL`), frontend on **port 8080**.

## Run mode: nonconcurrent

Only one workspace can run the stack at a time. The API points at a **shared
Neon Postgres** and runs migrations on boot, and the dev ports are fixed
(API 8000, web 8080). Stop one workspace's run before starting another's.
