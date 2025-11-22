#!/usr/bin/env bash
set -euo pipefail

# Start backend and frontend dev servers from repo root.
# Ports: backend :5000, frontend :5173 (default)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[setup] Installing dependencies (if needed)…"
npm --prefix "$ROOT_DIR/backend" install >/dev/null
npm --prefix "$ROOT_DIR/frontend" install >/dev/null

echo "[start] Launching backend (port 5000)…"
npm --prefix "$ROOT_DIR/backend" run dev &
BACK_PID=$!

echo "[start] Launching frontend (Vite, default port 5173)…"
npm --prefix "$ROOT_DIR/frontend" run dev &
FRONT_PID=$!

cleanup() {
  echo "\n[stop] Shutting down…"
  kill ${BACK_PID} ${FRONT_PID} 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "[ok] Dev servers running. Backend: http://localhost:5000  Frontend: http://localhost:5173"
wait

