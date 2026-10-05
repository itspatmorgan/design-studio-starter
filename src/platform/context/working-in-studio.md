---
title: Working in Design Studio
description: Standing requirements for preserving work, selecting context, and verifying changes.
---

Read [Contributor scope](contributor-scope.md) before changing prototype content or shared files. Existing task authorization covers necessary shared changes. Preserve user edits; do not reset, overwrite, or delete work to simplify a task.

Resolve the target prototype's assigned system before edits. Explicit `system: null` is custom styling. Only an omitted assignment follows the configured default. The browser's selected system does not change the assignment. Read only relevant product guidance; platform boundaries remain in force.

Honor enabled module declarations. A visible file or skill does not enable an unavailable capability. Use the owning module's technical contract before changing formats, dependencies, or lifecycle behavior. Product guidance cannot relax platform boundaries.

Run `pnpm build` before committing completed changes. Fix reported type, boundary, and asset errors rather than suppressing checks. Inspect rendered results for interface or prototype changes. Follow the [asset convention and guard](../core/assets.md).

Commit finished work with a concise message. Push only when requested. Sharing and [publishing](../core/publishing.md) are separate actions.
