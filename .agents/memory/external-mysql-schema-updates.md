---
name: External MySQL schema updates
description: Migration guidance for this project's externally hosted MySQL database.
---

Drizzle Kit push can exit during schema introspection even while the API can query the same live database. For a confirmed additive change, apply only the necessary DDL and verify the exact resulting columns; do not use a broad force push as a fallback.

**Why:** A live Xneelo MySQL change was blocked at Drizzle introspection, while application queries and a narrow table creation worked.

**How to apply:** Confirm the target database and the intended change, prefer the project schema as the source of truth, keep any fallback DDL additive and narrowly scoped, and verify its result before restarting the app.
