---
title: "Share work"
description: "Share repository changes and links without prescribing a team workflow."
section: "Collaborate"
order: 31
toc: true
---

Design Studio keeps work in repository files. Each contributor can run a local copy. Your team chooses its branching, review, and merge process.

## Save, commit, push, and publish

```mermaid
flowchart LR
  accTitle: Share repository files
  accDescr: Save and commit files locally. Push commits to the shared repository. Pull them into another local copy.
  local[Local files: save, then commit] -->|Push| repository[Shared repository]
  repository -->|Pull| copy[Another local copy]
```

| Action | Result |
| --- | --- |
| Save | Changes a file in your local copy. |
| Commit | Records a version in Git. |
| Push | Sends commits to the shared repository. |
| Pull | Receives repository changes into your copy. |
| Publish | Makes the build available through a configured host. |

The agent should check and commit completed work. Ask it to push when you want to share those commits. Saving or committing alone does not change another contributor's copy.

Repository files include prototype code, metadata, and any documents or canvases. Another person or agent can inspect that material directly. Your team decides what context and review it needs.

## Share a link

Copy an item's URL or select **Copy link** in its file menu. A local URL works only where that local server is accessible. A published site provides a shared viewing URL.

Renaming an item or prototype changes its URL. Check links after renaming or moving content.

Pushing commits does not publish a site. Sharing files through Git does not require hosting. To provide a viewing site, see [Publish a Studio](/guide/publishing). For changes outside your prototypes, see [Ownership and permissions](/guide/ownership-and-permissions).
