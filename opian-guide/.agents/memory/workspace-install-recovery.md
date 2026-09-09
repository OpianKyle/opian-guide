---
name: Workspace install recovery
description: How to recover a pnpm monorepo when one unrelated workspace package is blocked by the package firewall
---

When a pnpm workspace install is blocked by an unrelated dependency, install the affected frontend or service dependency graph with a frozen lockfile filter instead of bypassing the firewall or changing unrelated packages.

**Why:** The monorepo can contain code-generation or tooling packages that are not needed to run the visible app; resolving them can prevent otherwise healthy services from starting.

**How to apply:** Prefer `pnpm --filter <workspace>... install --frozen-lockfile` for the service being launched, then start only the workflows required for the requested preview.