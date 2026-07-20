---
name: Leads & Email Campaign System
description: How the leads, import, and 30-day drip campaign are structured across DB, API, and admin portal.
---

## Schema (MySQL — created manually, not via drizzle-kit push)
Three new tables created directly via mysql2 (drizzle-kit hangs on TTY):
- `leads` — email (unique), first_name, last_name, phone, company, status, source, email_day (0-30), campaign_active, notes, import_batch
- `lead_import_history` — source_url, imported_count, status
- `lead_email_logs` — lead_id, day, subject, status (sent/failed), error

Drizzle schema files: `lib/db/src/schema/leads.ts`, `lead_import_history.ts`, `lead_email_logs.ts`

## API Routes (all under requireAdmin middleware)
- `artifacts/api-server/src/routes/admin/leads.ts` — CRUD + Google Sheets import + email log fetch
- `artifacts/api-server/src/routes/admin/email.ts` — POST /admin/email/process-queue (sends next day's email to all active leads)
- Both registered in `artifacts/api-server/src/routes/admin/index.ts`

**Why:** Express route order matters — `/admin/leads/import` and `/admin/leads/import-history` must be registered BEFORE `/admin/leads/:id` (they are, in leads.ts router).

## Mailer (artifacts/api-server/src/lib/mailer.ts)
- Uses nodemailer with SSL (secure: true) on port 993
- `tls.rejectUnauthorized: false` for cPanel/self-signed certs
- Reads: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, SMTP_FROM_EMAIL

## 30-day Campaign (artifacts/api-server/src/lib/campaign.ts)
- `campaignTemplates` map: day 0–30, each with `subject` and `html(firstName)` function
- `getTemplate(day)` falls back to generic for any unlisted day
- Process queue: sends current day's email → increments emailDay → deactivates at day > 30

## Admin Portal Pages
- `artifacts/admin-portal/src/pages/leads.tsx` — full CRUD table + detail modal (Details/Notes/Emails tabs) + status update
- `artifacts/admin-portal/src/pages/import-leads.tsx` — Google Sheets import + process queue trigger + history + column reference
- Both added to App.tsx routes and AppLayout.tsx nav (UserPlus + Upload icons)

**Why:** Pages call `/api/admin/leads` directly (not via codegen hooks) since the OpenAPI spec additions weren't codegen'd into the client.
