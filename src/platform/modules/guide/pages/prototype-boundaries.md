---
title: "Prototype boundaries"
description: "Keep a prototype's code and styles independent of other work."
section: "Working in the studio"
order: 18
toc: true
---

Each prototype should remain safe to change, move, or remove. Dependency boundaries keep its code separate from other prototypes and private platform code.

## Explore freely inside the prototype

A prototype can start from scratch. Its assigned design system provides a toolkit, not a limit on what you can create.

Use system components for screens that match your product. Build local components, styles, and interactions when you need to explore something new.

You can combine both approaches in one prototype. For example, keep the product's navigation while trying a new editor built entirely from local components.

Keep experimental components in the prototype's own folder, such as `_components/`. Contain their styles so the experiment does not affect other prototypes or the studio.

You do not need to add an idea to the shared design system before testing it. If it becomes useful across prototypes, propose that shared change for maintainer review.

## Use permitted dependencies

A prototype can use these sources:

| Source | Example |
| --- | --- |
| Its own files | `./_components/header` |
| Its assigned design system | `@/systems/product/components/button` |
| Shared utilities | `@/lib/portal` |
| An enabled module's public library entry | `@module/<id>` |
| Installed packages | `react` |

It cannot import another prototype, another design system, or private platform files. A module's public library entry is the explicit platform exception.

These boundaries also apply to indirect and type-only dependencies. Shared utilities cannot depend on prototypes, design systems, or platform code.

Invalid dependencies produce errors during local development and fail the build. Ask your agent to correct the dependency rather than bypass the check.

## Reuse without coupling

To reuse another prototype's code, copy it into your folder. Changes to the copy will not affect the original.

A reusable component can also belong in the design system. Moving it there is a shared change that needs maintainer approval.

A canvas embeds only items from its own prototype. Copy another prototype's item before adding it to your canvas.

## Contain styles

Use Tailwind classes or CSS Modules (`*.module.css`) for prototype styles. CSS Modules must use local class selectors and cannot use global selectors.

Plain CSS imports from runtime components fail. Design-system themes load through the platform and must target their unique theme class or its descendants.

For contributor permissions, see [Working with others](/guide/working-with-others). For failed checks, see [Checks and troubleshooting](/guide/checks-and-troubleshooting).
