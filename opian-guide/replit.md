# OPIAN Advisor Portal — Project Overview

A pnpm monorepo for a financial advisory management platform. Three services run together:

| Service | Preview Path | Description |
|---|---|---|
| **OPIAN Advisor Portal** | `/` | Public-facing advisor portal (landing page + FNA, appointments, documents) |
| **OPIAN Admin Portal** | `/admin/` | Internal Command Centre for staff |
| **API Server** | `/api/` | Express 5 REST API backing both portals |

## Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI / Shadcn, Wouter, TanStack Query
- **Backend**: Node.js, Express 5, TypeScript, Pino logging
- **Database**: MySQL (xneelo-hosted), Drizzle ORM
- **API contract**: OpenAPI-first — `lib/api-spec/openapi.yaml` → codegen → React Query hooks + Zod schemas

## Monorepo layout

```
artifacts/
  opian-portal/       → Advisor Portal (react-vite, previewPath: /)
  admin-portal-bak/   → Admin Portal (react-vite, previewPath: /admin/)
  api-server-bak/     → API Server (Express, previewPath: /api/)
lib/
  db/                 → Drizzle schema + MySQL connection
  api-spec/           → openapi.yaml (source of truth)
  api-client-react/   → Generated React Query hooks (via Orval)
  api-zod/            → Generated Zod schemas (via Orval)
```

## Running the project

All three workflows start automatically. To restart individually:

- Advisor Portal: `pnpm --filter @workspace/opian-portal run dev`
- Admin Portal: `pnpm --filter @workspace/admin-portal run dev`
- API Server: `pnpm --filter @workspace/api-server run dev`

## After changing the API spec

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Required secrets

All set as Replit Secrets: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `SESSION_SECRET`, `SMTP_PASS`

## User preferences

- Keep existing project structure and stack (do not migrate or restructure)
