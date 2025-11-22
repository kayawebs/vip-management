#!/usr/bin/env bash
set -euo pipefail

# Start only the backend from repo root.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[setup] Installing backend dependencies (if needed)…"
npm --prefix "$ROOT_DIR/backend" install >/dev/null

echo "[start] Backend dev server on http://localhost:5000"
exec npm --prefix "$ROOT_DIR/backend" run dev

