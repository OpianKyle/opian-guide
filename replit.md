# OPIAN Advisor Portal

A full-stack financial advisor sales portal for managing clients, policies, appointments, FNA submissions, and documents.

## Stack

- **Frontend**: React + Vite (`artifacts/opian-portal`) — served at `/`
- **Backend**: Express API server (`artifacts/api-server`) — served at `/api`
- **Database**: MySQL via Drizzle ORM (`lib/db`) — hosted on xneelo
- **Shared libs**: `lib/api-spec` (OpenAPI), `lib/api-zod` (Zod schemas), `lib/api-client-react` (React Query hooks), `lib/db` (Drizzle schema + client)

## Running the project

Both services start automatically via their managed workflows:

| Service | Workflow name | Dev command |
|---|---|---|
| Frontend | `artifacts/opian-portal: web` | `pnpm --filter @workspace/opian-portal run dev` |
| API Server | `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` |

Install dependencies: `pnpm install`

## Environment variables / secrets required

| Key | Description |
|---|---|
| `DB_HOST` | MySQL host (xneelo) |
| `DB_PORT` | MySQL port (default 3306) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `SESSION_SECRET` | Long random string for session signing |
| `NODE_ENV` | `development` or `production` |

## Key pages (frontend)

- `/` — Landing page
- `/auth` — Login / registration
- `/dashboard` — Advisor dashboard
- `/appointments` — Appointment booking & management
- `/documents` — Document upload & management
- `/fna` — Financial Needs Analysis form
- `/fna-list` — FNA submissions list
- `/policies` — Client policies
- `/settings` — Account settings
- `/contact` — Contact page

## API routes

All routes are under `/api`. See `lib/api-spec/openapi.yaml` for the full OpenAPI spec.

After changing the spec, regenerate types with:
```bash
pnpm --filter @workspace/api-spec run codegen
```

## Database schema

Schema files live in `lib/db/src/schema/`. After editing, push changes with:
```bash
pnpm --filter @workspace/db run push
```

## User preferences

- Use pnpm for all package management (enforced by preinstall script)
- Keep existing project structure — do not restructure or migrate
