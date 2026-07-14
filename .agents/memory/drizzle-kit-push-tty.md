---
name: Don't force non-interactive drizzle-kit push against a live DB
description: drizzle-kit push/push-force needs a TTY and can hang non-interactively; check schema state first before considering it.
---

`drizzle-kit push`/`push --force` can hang or fail non-interactively ("Interactive prompts require a TTY terminal") since it expects an interactive confirmation that `--force` doesn't always skip.

**Why:** forcing it through anyway risks unintended destructive changes to a live database with real data.

**How to apply:** before running `drizzle-kit push` against a database that might already have data, check the schema directly first (a one-off script or `executeSql`). If it already matches, skip the push entirely rather than fighting the TTY requirement.
