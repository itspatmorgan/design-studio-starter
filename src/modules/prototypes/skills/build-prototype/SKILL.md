---
name: build-prototype
description: "Create or edit a Design Studio prototype view using its assigned system. Use for implementation of interactive screens and flows."
---

# Prototype workflow

Read the [prototype contract](../../README.md) when creating or reorganizing prototype files, metadata, or links, and before changing runtime dependencies or styles. It owns these technical requirements.

## Create and edit

- Create prototypes with `pnpm new "Prototype Name"`. Do not copy a whole prototype folder as a substitute for this command.
- A **Duplicate** action creates a separate exploration. If metadata has `rebuild`, read its target system guidance as well as the currently assigned system. Work only in the copy; migrate implementation and `system` together, verify it, then remove `rebuild`. Preserve the original. The target is a request, not the current runtime assignment.
- Write new views as `.tsx` with a default-exported React component. Keep helper files under underscore names, such as `_components/`.
- Replace the `emptyView` export when implementing an empty view.
- Use the assigned design system as a toolkit. Build local components when the experiment needs them.
- For `system: null`, use local components and CSS Modules; no existing system is assigned. Do not replace this explicit choice with the studio default.
- Follow that system's component APIs, token conventions, and icon library. For starter components, use Base UI's `render` prop instead of `asChild`.
- Read the [system authoring context](../../../systems/context/authoring.md) when working with components, themes, or pop-ups.
- Re-read files before changing them. The person can edit and reorganize content in the running app.
- When changing files directly, update metadata and internal links using the prototype contract. Report incoming links for other owners to update.

## Dependencies and styles

Follow the [static asset convention](../../../../platform/context/technical/assets.md) when adding images, logos, fonts, or shared static files.

Follow the prototype contract's [dependency boundaries](../../README.md#dependency-boundaries). Use permitted dependencies and local styles; fix boundary errors instead of bypassing checks.

Keep experiments local until an authorized shared change moves them into the system.

## Verify and save

- Read rendering errors before changing code. Fix type and boundary errors rather than suppressing them.
- Run `pnpm build` before committing completed work. Inspect the rendered result when changing views.
- Follow the [Asset Guard](../../../../platform/context/technical/assets.md#asset-guard). Compress oversized assets instead of bypassing the check.
- Commit finished work with a concise message. Push only when the person asks to share.

A push runs repository checks. Publishing depends on the repository's deployment workflow; see [Publishing](../../../../platform/context/technical/publishing.md).
