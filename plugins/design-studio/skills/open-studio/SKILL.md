---
name: open-studio
description: Reopen or continue working in an existing local Design Studio, preserving its prototypes, systems, and configuration. Use create-studio for a new installation.
---

Use the current primary project folder or a studio folder identified by the user. If neither establishes the location, ask which studio to open. Do not silently create another studio or scan unrelated personal folders.

1. Read the target's `AGENTS.md` and required context and procedures. Confirm its studio configuration, package manifest, and Studio system exist. A missing plugin receipt does not mean it needs initialization.
2. For a plugin-created studio, run the installed [bootstrap helper](../../scripts/bootstrap.mjs) with `inspect --destination <absolute-folder>`. Otherwise use the target's documented setup commands. Preserve configuration, contributor registrations, systems, and prototypes.
3. Reuse a server only when its process belongs to this folder. Otherwise install missing dependencies with the pinned tools, then start its dev server in a persistent local terminal. Plugin-created studios can use `start --destination <folder>`. Read the actual loopback URL and open it through the supported browser/preview capability.
4. If this chat already works in the studio folder, continue there. Otherwise follow [Host handoff](../create-studio/references/host-handoff.md) for Codex desktop, Cursor, or Claude Code. An offered link is pending until opened. Preview opening, workspace opening, and persistent project registration are distinct results.
5. Verify the rendered studio and report its folder and preview link. For edits, follow this repository's instructions and assigned system. Never download over existing work, reset its history, overwrite configuration, or create a remote unless requested.
