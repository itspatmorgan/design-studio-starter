---
title: "Modules"
description: "Choose the studio's capabilities and manage its configuration."
section: "Maintaining the studio"
order: 20
toc: true
---

Design Studio is built from modules. Each module adds a capability, such as the Guide or a prototype file type.

The starter establishes this foundation so you can add, disable, or remove features in your own studio.

## Extend your studio

You own the code and can change any part of it. For a new platform feature, we recommend building a module.

Modules provide consistent places for code, content, checks, and agent instructions. Clear boundaries help contain changes and make custom features easier to maintain.

Keeping extensions separate also helps the starter maintainer understand your setup and support it. Future platform updates are easier to review when custom features use the documented extension points.

See [Build a module](/guide/build-a-module) for the structure and creation workflow.

Managing modules is a shared platform change. Ask your agent to perform it as part of an authorized maintainer task.

## See what is installed

Ask: "List the studio's modules."

Prototypes, Views, Text files, Handbook, and Systems are required modules. Code-based views are the core of a prototype.

Documents and Canvases add optional ways to explain and explore the work. You can disable either feature. The Guide is also optional.

**Systems** is the module that supports design systems. Each prototype design system is separate content in `src/systems/`.

## Turn a module off

Ask your agent to turn off an optional module. Its files remain, but its capabilities are unavailable. Restart the dev server after the change.

Turning off a file type hides its items from normal navigation. It does not delete the files. Consider retained content before disabling a type.

Disabling Documents affects Markdown files within prototypes. The Handbook and Guide keep their own Markdown support.

Ask the agent to turn the module on again when you need it.

## Add a module

Ask your agent to build a module for the feature you need. If you already have a prepared module folder, ask it to preview installation.

Before installation, review:

- The source and what the module provides.
- The files it adds and their destinations.
- Required packages and any upstream license.
- Agent rules, skills, and checks it includes.

Approve installation only for code you trust. Preview reads the prepared folder as data. Installation can run its checks as trusted code on your computer.

Packages install with lifecycle scripts disabled. If an installation check fails, project files are restored. Downloaded packages may remain in `node_modules`.

Restart the dev server after installation.

## Remove a module

Ask your agent to preview removal. It checks for code that depends on the module and explains what must change first.

Removal deletes the module and its installed Handbook files. Content folders remain unless you also request their removal.

Restart the dev server after removal. Required modules cannot be removed with this command.

## Manage design systems

Design systems use the same preview and installation process. See [Systems](/guide/systems) for replacing Product or adding another system.

Adding another system preserves the current default. Changing the default through the configuration command preserves existing prototypes' system choices.

## Studio configuration

`studio.config.ts` stores the studio's shared choices:

| Setting | Purpose |
| --- | --- |
| Name | Identifies the studio. |
| Tagline | Describes it on the deployed front page. |
| Usage | Guides personal or team onboarding. |
| Modules | Selects optional capabilities. |
| Default system | Selects the system for new prototypes. |

Ask your agent to configure these settings. It previews changes before applying them.

The agent can inspect setup with `pnpm -s studio status --json`. This report does not replace verifying a build and a working prototype.

For extension development, see [Build a module](/guide/build-a-module).
