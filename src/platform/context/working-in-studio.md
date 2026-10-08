---
title: Working in Design Studio
description: Standing requirements for preserving work, selecting context, and verifying changes.
---

Read [Contributor scope](contributor-scope.md) before changing prototype content or shared files. Existing task authorization covers necessary shared changes. Preserve user edits; do not reset, overwrite, or delete work to simplify a task.

Resolve the target prototype's assigned system before edits. Explicit `systemId: null` is custom styling. A missing assignment is invalid. Creation writes the selected system ID explicitly. The browser's selected system does not change the assignment. Read only relevant product guidance; platform boundaries remain in force.

Honor enabled module declarations. A visible file or skill does not enable an unavailable capability. Use the owning module's technical contract before changing formats, dependencies, or lifecycle behavior. Product guidance cannot relax platform boundaries.

Follow [explicit declaration](principles.md#declare-what-the-system-provides) for behavioral configuration, including contributor profiles. Write defaults visibly in scaffolds and registration; validate missing required fields instead of activating behavior through omission.

Run `pnpm build` before committing completed changes. Fix reported type, boundary, and asset errors rather than suppressing checks. Inspect rendered results for interface or prototype changes. Follow the [asset convention and guard](assets.md).

Commit finished work with a concise message. Push only when requested. Sharing and [publishing](publishing.md) are separate actions.
