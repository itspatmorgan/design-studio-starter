---
title: "Build a module"
description: "Use the module structure to add features to your own studio."
section: "Reference"
order: 43
toc: true
---

This page is for people extending their own studio. A module is a folder with a `module.ts` declaration and optional capability files.

You can change any code you own. We recommend modules for new platform features because they provide consistent extension points and dependency boundaries.

Keeping custom features in modules makes their changes easier to review and helps when applying future platform updates.

## Create a module

1. Ask your agent to create a module, such as `quote-wall`.
2. Review the preview from `pnpm studio create-module quote-wall`.
3. Approve creation when the files and purpose are correct.
4. Restart the dev server.

The starter includes a declaration, an app page, and a Handbook rule. The app page appears at the module's address.

The module lives in `src/platform/modules/<id>/`. Keep its implementation there and use the documented extension points to connect it to the studio.

## Available capabilities

| File or folder | Capability |
| --- | --- |
| `module.ts` | Declares identity, compatibility, and an optional content section. |
| `app.tsx` | Adds navigation, routes, palette entries, or prototype actions. |
| `type.ts` and `open.tsx` | Declare and display a file type. |
| `server.ts` | Adds local dev-server routes. |
| `check.ts` | Runs a module check while enabled. |
| `lib/index.ts` | Exposes a public library through `@module/<id>` when `lib: true`. |
| Handbook files | Supply agent rules and skills. |

The repository reference at `src/platform/modules/README.md` describes the fields and extension contracts.

## Keep dependencies contained

An optional module must be removable. Modules cannot depend on another optional module's implementation.

Platform modules can use required modules. Runtime library code has tighter boundaries: its own library, shared utilities, packages, and permitted public entries.

Prototypes use only the enabled module's `@module/<id>` entry. They cannot import its private library files. Run `pnpm check` to verify dependencies.

## Verify your module

1. Run `pnpm check` and fix reported problems.
2. Run `pnpm build`.
3. Review the feature in the local app.
4. If the module is optional, verify the studio also works with it disabled.

Declare compatibility with `requires` when needed. A module that requires a newer platform version is disabled.

When adapting an open source library, retain its license and record its source. If you vendor its code, record adaptations in `CHANGES.md`.

When updating the platform, review changes to the extension points your module uses. Run the checks and review your feature again.

## Installation details

A prepared module folder is read as data during the installation preview. Applying installation can run its checks as trusted code.

Packages install with lifecycle scripts disabled. These are scripts a package would normally run automatically during installation.

If a check fails, project files are restored. Downloaded packages can remain in `node_modules`.

Module skills live in `src/handbook/skills/` after installation. Links in `.agents/skills` and `.claude/skills` expose those files to compatible agents.

## Design systems

A prototype design system is separate content in `src/systems/<id>/`. It contains `system.ts`, `components/`, and `styles/theme.css`.

Create a starter with `pnpm studio create-system <id>`. You do not need to build a platform module to add a design system.

Use [Manage design systems](/guide/systems) for the user workflow and the system rules in the Handbook for implementation requirements.
