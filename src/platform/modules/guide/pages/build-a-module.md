---
title: "Build a module"
description: "Create an extension for your studio or a pack for other studios."
section: "Reference"
order: 40
toc: true
---

This page is for maintainers and extension authors. A module is a folder with a `module.ts` declaration and optional capability files.

## Create a module

1. Ask your agent to create a module, such as `quote-wall`.
2. Review the preview from `pnpm studio create-module quote-wall`.
3. Approve creation when the files and purpose are correct.
4. Restart the dev server.

The starter includes a declaration, an app page, and a Handbook rule. The app page appears at the module's address.

To create a separate pack, use `--out <folder>`. A pack is the installable folder you can share with another studio.

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

## Share a pack

1. Set `requires` to the oldest compatible platform version, if needed.
2. Declare the module's license and any upstream library information.
3. Include the required upstream license files.
4. Verify the pack in a disposable studio copy.
5. Put the pack in a Git repository.

An incompatible module is disabled. The installer rejects missing or unsupported licenses unless the person installing it explicitly allows an exception.

Installation previews show the files and packages before approval. After approval, the module's checks can execute on the recipient's computer.

If you vendor a library, keep it in the pack and record your adaptations in `CHANGES.md`.

## Design-system packs

A design-system pack contains `system.ts`, `components/`, and `styles/theme.css`. Create a starter with `pnpm studio create-system <id>`.

Use [Systems](/guide/systems) for the user workflow and the system rules in the Handbook for implementation requirements.
