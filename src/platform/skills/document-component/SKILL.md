---
name: document-component
description: "Import or document a prototype-system component with a page and live examples."
---

## Scope and input

Read the [systems rule](../../rules/systems.md) and [component contract](../../../platform/modules/systems/reference.md#component-pages).

Identify the target system and component. Preserve existing source, examples, and documentation. Follow the user's library rather than assuming every system uses shadcn.

## Import when needed

For starter shadcn components, inspect `components.json` before running `npx shadcn add <name>`.

For another destination, use `--path src/systems/<system>/components`. Adapt a generated `cn` import to `@/lib/utils` when required.

Apply the system's theme and portal requirements. Skip import when documenting an existing component.

## Create and complete documentation

1. Run `pnpm component-docs <system> <component>`. The command creates missing files and preserves existing files.
2. Fill the page's title, description, and `## When to use` section. Add other guidance only when useful.
3. Add representative examples covering meaningful variants and states. Replace unfinished required-prop placeholders.
4. Keep examples unwrapped. The platform supplies the theme frame.

The system contract defines file names, exports, and documentation validation. Do not maintain a second schema here.

## Completion

Run `pnpm build`. Inspect `/systems/<system>/<component>` and the examples in supported color modes.

Report completed files and any missing component behavior or source material. Do not claim completion while examples contain placeholders.
