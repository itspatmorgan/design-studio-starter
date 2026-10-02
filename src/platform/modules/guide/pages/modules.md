---
title: "Extend your Studio"
description: "Choose capabilities and add features through modules."
section: "Maintain"
order: 22
toc: true
---

Design Studio is built from modules. Modules give features defined places for code, content, checks, and agent instructions.

You own the code and can change any part. For new platform features, we recommend modules: their boundaries contain custom changes and make future platform updates easier to review. See [Build a module](/guide/build-a-module) for implementation details.

## Required and optional parts

Prototypes, Views, Text files, Handbook, and Systems are required. Code-based views are the core of the environment.

Documents and Canvases are optional prototype file types. The Guide is also optional. Ask your agent to list installed modules or configure the optional capabilities.

Design systems are separate content in `src/systems/`, supported by the Systems module.

## Disable or remove

Disabling a module keeps its files but makes its capabilities unavailable. Disabling a prototype file type hides its items from normal navigation. It does not delete them.

Disabling Documents affects prototypes only. The Handbook and Guide keep their own Markdown support.

Removal deletes the module and its installed Handbook files. Content folders remain unless you request their removal. The removal preview checks for dependencies that need to change first. Required modules cannot be removed with this command.

Restart the dev server after module changes.

## Add a feature

Ask your agent to build a module or preview installation from a prepared folder. Review its capabilities, dependencies, license, agent instructions, and proposed file changes.

Installation can run the module's checks as code on your computer. Use code you trust. Packages install with lifecycle scripts disabled. If a check fails, project files are restored; downloaded packages can remain in `node_modules`.

Module changes are shared platform changes. Configuration choices are documented in [Studio config](/guide/studio-config).
