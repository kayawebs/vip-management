# Repository Guidelines

## Project Structure & Module Organization
- Backend lives in `backend/src`:
  - `controllers/` (pure handlers), `routes/` (Express routers), `models/` (Mongoose schemas; singular PascalCase), `services/` (integrations like SMS). 
  - Entry: `backend/src/index.js` wires middleware and MongoDB.
  - API smoke tests sit beside backend root (e.g., `backend/test-vip.js`, `backend/test-server.js`).
- Frontend is SvelteKit under `frontend/src`:
  - `routes/` (pages), `lib/` (reusable UI/components), `static/` (assets shipped as-is).

## Build, Test, and Development Commands
Use separate terminals per stack.

```bash
cd backend && npm install && npm run dev        # hot-reload API on :5000
cd backend && npm run test:server               # Node-based endpoint smoke tests
cd backend && npm run test:vip                  # focused flow (see test file header)
cd backend && npm run test:discount             # focused flow
cd frontend && npm install && npm run dev       # Vite dev server (defaults :5173)
cd frontend && npm run build && npm run preview # production build + static preview
cd frontend && npm run check                    # Svelte + TS type/lint checks
```

## Coding Style & Naming Conventions
- Backend: CommonJS, 2-space indent, semicolons. Route files kebab-cased (e.g., `vip.routes.js`). Models are singular PascalCase in `backend/src/models`. Export pure business rules from `controllers/`.
- Frontend: Svelte conventions; components in `frontend/src/lib` are PascalCase. Prefer TypeScript for stores/utilities. Name DTOs descriptively (e.g., `vipPayload`, `discountRequest`). Keep env-dependent values in `process.env` (backend) and `$env/static/private` (frontend).

## Testing Guidelines
- Extend lightweight Node scripts (`backend/test-<feature>.js`). Document required request payloads at the top of each file.
- Stub external SMS by injecting fake credentials where possible.
- Frontend changes must pass `npm run check`. When touching forms, add a colocated `+page.spec.ts` with basic DOM assertions (Vitest + Testing Library acceptable).
- Target at least one happy-path and one failure-path per endpoint/mutation.

## Commit & Pull Request Guidelines
- Commits: short, imperative summaries (e.g., “add sms”, “add vip consume”). Group backend/frontend changes separately; reference issue IDs when available.
- PRs: state intent, list verification commands you ran, and attach screenshots/GIFs for UI-visible changes.

## Security & Configuration Tips
- Provide `backend/.env` with `MONGODB_URI`, `JWT_SECRET`, and SMS provider keys. Do not commit secrets. Rotate any leaked credentials and document placeholder names in `sms-dependencies.md`.
