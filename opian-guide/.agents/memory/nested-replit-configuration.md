---
name: Nested Replit configuration
description: Avoid replacing workspace workflow configuration when updating an imported app's nested Replit dotfile.
---

The `verifyAndReplaceDotReplit` callback targets the workspace-root `.replit`; the path supplied for its temporary TOML does not select a nested `.replit` file. Passing nested app configuration to it can replace the root workflows and ports.

**Why:** The workspace root and imported app both contain Replit configuration, and the root config owns the active preview workflow.

**How to apply:** Read and preserve the actual workspace-root `.replit` before using the validator. Do not pass a nested app's `.replit` contents as the replacement.
