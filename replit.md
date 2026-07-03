# OPIAN Advisor Sales Portal

A professional internal portal for OPIAN NFS Group financial advisors to manage clients, submit Financial Needs Analysis (FNA) forms, track policies, book appointments, and access documents.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/opian-portal run dev` — run the frontend (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/opian-portal/src/pages/` — all page components (dashboard, fna, fna-list, policies, appointments, documents, contact, settings)
- `artifacts/opian-portal/src/components/layout.tsx` — sidebar + main layout shell
- `artifacts/api-server/src/routes/` — backend route handlers (dashboard, fna, advisors, policies, appointments, documents)
- `lib/db/src/schema/` — Drizzle ORM table definitions
- `lib/api-spec/openapi.yaml` — single source of truth for API contracts

## Architecture decisions

- OpenAPI-first: all API contracts defined in `openapi.yaml`, Orval generates React Query hooks and Zod schemas
- Multi-step FNA form with step-level validation before advancing to next section
- Navy (#1B2A4A) + Gold (#C9A52A) + Cream (#F5F0E8) design system matching OPIAN brand identity
- Numeric fields from PostgreSQL `numeric` type are cast to `Number()` before Zod parsing in route handlers

## Product

- **Dashboard** — welcome screen with stat cards (active policies, appointments, documents, account status), quick actions, assigned adviser card, and services grid
- **FNA Form** — multi-step Financial Needs Analysis form for onboarding new clients
- **FNA Submissions** — list/review of all submitted FNA forms with status management
- **My Policies** — view all active and lapsed client policies
- **Appointments** — schedule and manage advisor meetings
- **Documents** — secure document storage and upload tracking
- **Contact Adviser** — adviser details and contact form
- **Settings** — profile and account settings

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `numeric` columns from Drizzle return strings; always cast with `Number()` before Zod parsing in route handlers
- Run `pnpm run typecheck:libs` after editing any `lib/*` package to rebuild declarations before checking artifact packages
- Express 5 wildcards require names: use `/{*splat}` not `*`
- Never use `console.log` in server code — use `req.log` or `logger` from pino

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
