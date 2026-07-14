---
name: Artifact re-registration after GitHub import
description: artifact.toml exists on disk but the platform's routing registry doesn't know about it (502s, empty listArtifacts) after a GitHub import.
---

A GitHub import can bring `artifacts/*/.replit-artifact/artifact.toml` files without restoring the platform's internal artifact/routing registry — `listArtifacts()`/`listWorkflows()` come back empty and the path-based router (port 80 / dev domain) 502s on the previewPath, even though the dev server itself runs fine on its own port.

**Why:** the preview pane's public router only forwards to registered artifact services, not to arbitrary hand-configured workflow ports — hand-rolling a `configureWorkflow` + reverse proxy will run the app but never becomes reachable through the real preview/dev domain.

**How to apply:** don't hand-write workflows as the fix. Back up the artifact directory, move it aside, call `createArtifact` with the same slug/previewPath/title to re-scaffold + re-register (this can also auto-detect and register untouched sibling artifacts), then restore the original source files over the freshly scaffolded ones — diff first, since the scaffold usually only touches a handful of files (`App.tsx`, `index.css`, a couple of `components/ui/*`, `vite.config.ts`). Leave the new `.replit-artifact/artifact.toml` alone. Remove any interim manual workflows and watch for `EADDRINUSE` from leftover processes on their old ports before restarting the real managed workflow.
