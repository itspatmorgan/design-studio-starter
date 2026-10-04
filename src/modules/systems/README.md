---
title: "Systems"
description: "Browse the materials and knowledge for your work."
section: "Studio"
order: 12
toc: true
slug: "systems"
---

# Systems

Systems brings together the components, styles, and knowledge used by your prototypes. Use the selector to switch between systems. One navigation tree shows the selected system’s theme, components, context, rules, and skills.

The Contents toolbar searches across the tree and expands or collapses all folders. Search reveals matches without losing your previous expansion choices. Context, Rules, Skills, and Theme start open; Components starts closed until you expand it or visit a component. Guidance appears above the toolkit, and each guidance group has its own **New** action.

## Prototype systems and Studio

**Product** is the starter toolkit for prototype views. Replace or adapt it to match your product. You can add more systems when different work needs a different toolkit.

**Marketing** demonstrates a second prototype toolkit, using a small Untitled UI subset. The Design Studio Marketing prototype uses its own palette, typography, and components alongside Product.

**Studio** supplies Studio's own interface: navigation, menus, editors, and documentation. It stays separate from prototype design systems.

Each prototype uses an assigned system and can also have local components and styles.

## Explore the toolkit

Theme shows the colors, typography, radius, shadows, spacing, motion, and effects declared in the system’s theme file. Component pages show examples, source, and available properties. These help you and your agent understand what you can use.

A system declares whether it supports light mode, dark mode, or both. Systems with one mode keep that appearance in their pages, prototype views, and embeds while Studio follows its global toggle.

## Bring your own system

Ask your agent to import your components, tokens, fonts, and supported color modes. You can keep the starter while exploring and replace it later.

System files are shared team content. Coordinate changes with your maintainer. Changing the default system preserves existing prototypes' system choices; migrating a prototype is a separate change.

Foundations are generated from its theme file; component pages combine documentation, examples, and component source. Source is available through navigation, using the [shared file workflow](/documentation/guide/home#working-with-files). Component pages offer separate source tabs for documentation, examples, and component code.

## Context, rules, and skills

Each system can also hold product knowledge, standing constraints, and task procedures. These are ordinary files beside its components and styles.

| Part | What belongs there |
| --- | --- |
| Context | Personas, principles, research, and shared knowledge. |
| Rules | Constraints for work using this system. |
| Skills | Procedures for specific tasks. |

Expand a folder to read, add, or edit its files. Other folders stay available as you browse. Empty sections are fine; add material when it improves the work. Give your agent supplied context and ask it to connect relevant files to the system's instructions.

A prototype uses its assigned system's knowledge along with platform operating rules and its own local intent. Files being visible here does not automatically load them into an agent conversation.

Studio contains Design Studio's own context and instructions. Keep your product context in its product system. System knowledge follows Studio's appearance; UI examples follow the system's supported color modes.

## For developers

Read the [module contract](reference.md) for file structure and implementation details.

The design systems pages, at `/systems`: what each system has, its tokens, and a page per component. Required. The systems themselves are
folders in `src/systems/<id>/`, which are your content.

- `module.ts`, `app.tsx`: who it is, its rail button and routes.
- `spec.ts`: what a `system.ts` declares (`SystemSpec`) and the check for it.
- `sources.ts`, `docs.ts`, `scaffold.ts`, `themeTokens.ts`: where a component came from, how its docs and props are read, the starter docs a new component gets, and the theme's tokens.
- `pages/`, `data/`: the Systems pages and the loaders behind them (browser).
- `node/`: finding systems, building their docs and props, and `pnpm component-docs` (Node).
