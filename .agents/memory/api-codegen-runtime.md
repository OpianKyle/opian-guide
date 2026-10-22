---
name: OpenAPI code generation runtime
description: Runtime compatibility note for regenerating API clients in this workspace.
---

Node 20 runtimes do not provide `Map.groupBy`, which Orval 8.43 uses during code generation. The Zod generator cleans its output directory before generating, so a runtime failure can leave generated Zod files deleted.

**Why:** The normal codegen command failed after cleaning the generated output, making a retry necessary to restore the workspace.

**How to apply:** Use a newer Node runtime or a temporary `Map.groupBy` compatibility shim for the codegen process, then confirm the generated Zod files exist.
