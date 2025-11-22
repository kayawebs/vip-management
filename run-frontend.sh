#!/usr/bin/env bash
set -euo pipefail

# Start only the frontend from repo root.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[setup] Installing frontend dependencies (if needed)…"
npm --prefix "$ROOT_DIR/frontend" install >/dev/null

echo "[start] Frontend Vite dev server (default http://localhost:5173)"
exec npm --prefix "$ROOT_DIR/frontend" run dev

