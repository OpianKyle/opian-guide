---
name: Git import history
description: Recovering Replit projects whose local Git history is unrelated to the configured GitHub remote
---

When an imported project has no merge base with its configured GitHub remote, preserve the local branch, fetch the remote, and connect the histories with an explicit merge that keeps the current working tree before using the Git panel.

**Why:** Replit can initialize a workspace-level repository independently from a cloned project, and Git UI operations fail with an opaque fatal error when the local and remote histories are unrelated.

**How to apply:** Create a local backup branch first; never reset or force-push automatically. Leave any uploaded workspace assets uncommitted unless the user explicitly asks to version them.