---
name: Iframe editor focus
description: Preserving focus in iframe-based rich-text email editors.
---

Treat an iframe's contenteditable document as the live editing surface while the user types. Serialize from a clone rather than changing the live document, and avoid rerendering or replacing the iframe for each keystroke.

**Why:** The email campaign editor lost focus during typing when an update changed the iframe's live editing state.

**How to apply:** Keep parent state updates from resetting the iframe or its selection, and verify multi-character typing in the signed-in editor after changes.
