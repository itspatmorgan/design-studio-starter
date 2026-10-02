---
title: "Prototype boundaries"
description: "Keep a prototype's code and styles independent of other work."
section: "Working in the studio"
order: 18
toc: true
---

Each prototype should remain safe to change, move, or remove. Dependency boundaries keep its code separate from other prototypes and private platform code.

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
