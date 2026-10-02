---
title: "Modules"
description: "Choose the studio's capabilities and manage its configuration."
section: "Maintaining the studio"
order: 20
toc: true
---

A module adds a capability to the studio. Examples include the Guide and the file types used by prototypes.

Managing modules is a shared platform change. Ask your agent to perform it as part of an authorized maintainer task.

## See what is installed

Ask: "List the studio's modules."

Prototypes, Handbook, and Systems are required modules. The Guide and the view, document, canvas, and text file types are optional.

**Systems** is the module that supports design systems. Each prototype design system is separate content in `src/systems/`.

## Turn a module off

Ask your agent to turn off an optional module. Its files remain, but its capabilities are unavailable. Restart the dev server after the change.

Turning off a file type hides its items from normal navigation. It does not delete the files. Consider retained content before disabling a type.

Ask the agent to turn the module on again when you need it.

## Add a module

Give your agent a local folder, Git repository address, or download address. Ask it to preview the module.

Before installation, review:

- The source and what the module provides.
- The files it adds and their destinations.
- Required packages and any upstream license.
- Agent rules, skills, and checks it includes.

Approve installation only for code you trust. Preview reads the pack as data. Installation can run its checks as trusted code on your computer.

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
