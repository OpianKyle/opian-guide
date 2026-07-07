---
name: MySQL migration
description: Switched lib/db from PostgreSQL (pg + drizzle pg-core) to xneelo MySQL (mysql2 + drizzle mysql-core). Key constraints and gotchas.
---

## Rule
Use `drizzle-orm/mysql-core` and `mysql2` throughout. Never reintroduce `pg` or `drizzle-orm/pg-core`.

**Why:** The project uses the user's xneelo MySQL database (credentials in secrets: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD). There is no DATABASE_URL — connection uses individual env vars.

## How to apply
- Column types: `mysqlTable`, `int().autoincrement()` (not `serial`), `varchar` for indexed/unique string fields, `decimal` for money, `text` for long strings, `json.$type<T>()` for JSON arrays where the API contract expects an array type.
- `.returning()` does NOT exist in mysql-core — always do insert/update then re-fetch by ID or unique field.
- `$returningId()` gives back `[{ id: number }]` after insert — use that to re-fetch.
- `lib/db` is a composite TS project — after schema changes, run `pnpm exec tsc --build` in `lib/db` to regenerate `dist/*.d.ts` before running api-server typecheck.
- `drizzle-kit push` can hang on schema comparisons against xneelo — apply column changes manually via mysql2 when push stalls.
- `mysql2` must be a direct dependency in BOTH `lib/db/package.json` AND `artifacts/api-server/package.json` (it's externalized in the esbuild bundle).
- `priorities` in fnaTable stays as `text` (not `json`) because the api-zod contract defines it as `string`.
