# OPIAN Advisor Portal

A pnpm monorepo for the OPIAN financial advisory platform, consisting of three artifacts:

## Artifacts

| Artifact | Path | Description |
|---|---|---|
| `artifacts/opian-portal` | `/` | Public-facing advisor portal (landing page + advisor login/dashboard) |
| `artifacts/admin-portal` | `/admin/` | Admin portal (OPIAN Command Centre — staff login, leads, advisors, clients) |
| `artifacts/api-server` | `/api/` | Express 5 REST API server (Node.js + TypeScript) |

## Shared Libraries (`lib/`)

- **`lib/db`** — Drizzle ORM schema + MySQL2 client (external MySQL on xneelo)
- **`lib/api-spec`** — OpenAPI YAML spec (`openapi.yaml`)
- **`lib/api-client-react`** — Generated React Query hooks from the OpenAPI spec
- **`lib/api-zod`** — Generated Zod validation schemas from the OpenAPI spec

## Running the project

All three workflows start automatically. From the shell:

```bash
# Install dependencies
pnpm install

# Start individual services
pnpm --filter @workspace/opian-portal run dev
pnpm --filter @workspace/admin-portal run dev
pnpm --filter @workspace/api-server run dev
```

## Database

External MySQL on xneelo. Credentials are stored as Replit secrets:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Schema is managed with Drizzle ORM. After schema changes:
```bash
cd lib/db && tsc --build && pnpm run push
```

Key tables: `users`, `advisors`, `admins`, `leads`, `lead_email_logs`, `lead_import_history`, `clients`, `appointments`, `policies`, `documents`, `fna`

## Auth

Session-based auth via `SESSION_SECRET`. The admin portal is fully protected — navigate to `/admin/login` to sign in.

## User preferences

- Use pnpm for all package management (not npm/yarn)
- TypeScript strict mode throughout
- Express 5 for the API server (no `app.use(express.Router())` pattern changes)
