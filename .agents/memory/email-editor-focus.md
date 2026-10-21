---
name: Iframe editor focus
description: Preserving focus in iframe-based rich-text email editors.
---

Treat an iframe's contenteditable document as the live editing surface while the user types. Serialize from a clone rather than changing the live document, store keystroke updates in a ref, and commit React state only when saving or switching to preview.

**Why:** Parent state updates during typing can disrupt the iframe's selection even when the editor component is memoized; Save and Preview still need the latest HTML.

**How to apply:** Keep the iframe mounted and avoid parent state updates per keystroke. Read the live HTML ref for Save and Preview, and verify multi-character typing in the signed-in editor after changes.
