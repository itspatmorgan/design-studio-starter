---
title: Help
description: Find, edit, reopen, and troubleshoot your studio.
order: 6
toc: true
---

## Where is my work?

Your studio is a folder on your computer. Prototypes, systems, and guidance are saved there. Work with your coding agent in that folder. A preview URL does not select the folder in your coding app.

Use **⌘K / Ctrl+K** to search the studio. **⌘; / Ctrl+;** shows or hides navigation. Right-click a file-backed item to copy its link or path, reveal it in Finder, or open it in an editor where available.

## How do I reopen or install Studio?

Open the same folder in your coding app and ask “Open my Design Studio.” For a new installation, another studio, or a teammate's setup, use the [public setup instructions](https://github.com/itspatmorgan/design-studio-starter/blob/main/SETUP.md).

The plugin helps create and open studios; updating it does not automatically update your existing studio's code.

## Does Studio run an agent?

No. Use your coding app's agent to change the studio's files, then review them in Studio. Creating an item through the interface does not start an agent task. You can direct the work in plain language without writing code.

## How do I edit source?

Locally, right-click a document or artifact and choose **Edit source**. **⌘' / Ctrl+'** toggles between source and rendering where supported. **⌘S / Ctrl+S** saves; **Done** returns to the result. Unsaved edits require confirmation before leaving. Canvases save automatically.

**Open in editor** uses an installed code editor; otherwise Studio offers Finder as a fallback. You can edit supported source inside Studio without another editor.

## Why can't I edit something?

Published sites are for viewing. Locally, contributor scope and archive status determine editing access. Ask your agent to check your identity and permissions. See [team access](/documentation/guide/customize#how-does-team-access-work).

## Why is a tool or artifact missing?

An optional module may be disabled or uninstalled. Check Studio settings or ask your agent. Disabling a module preserves saved content. Archiving a prototype keeps it locally but excludes it from publication.

## Why aren't my changes appearing?

Confirm your agent is editing the folder for this running studio. Check that you saved the file and opened the intended artifact. A published site needs another publication before local changes appear online.

A different default system does not rebuild existing prototypes. A copy marked **Rebuild needed** still needs your agent to migrate it.

## What if something breaks or a link fails?

Give the agent the error message, affected artifact, and what you were doing. Ask it to preserve work while investigating. Links can need repair after deletion or moves while Studio was closed. A localhost link requires a running local studio; use a published link for remote review.

The agent can consult [Checks and fixes](/documentation/context/platform.core/context/checks). If you need an earlier version, ask it to inspect available Git history. A local save is not itself a recovery snapshot.
