---
title: "Modules"
description: "The parts of Design Studio you can turn off, add, or remove, and how."
section: "Core concepts"
order: 18
toc: true
---

A module is one part of Design Studio that you can add or take away: the Guide you're reading, Tools, the Handbook, and the design systems are all modules. Each one is a folder in the repo. Because they follow the same rules, a team can turn parts off, and other people can build modules that you add without anyone changing the platform.

You don't run commands for this. Ask your agent, and it follows the steps in `src/handbook/rules/modules.md`.

## See what you have

Ask your agent to list the modules. Each one is **on**, **off**, or **required**. Required ones (Prototypes, the Handbook and the design systems) can't be turned off, because the rest of the app is built on them. The Guide and Tools are optional, and so are the kinds of file a prototype holds: views, documents, canvases, and plain text files each come as a module you can turn off or remove.

## Turn one off, or on

"Turn off the Guide" changes one line in `studio.config.ts`. Its files stay, so turning it back on is another line. The app doesn't show it, and nothing else breaks. Restart the dev server for the change to show.

## Add a module

Modules come from a **source**: a folder on your computer, a git address (like a GitHub repository), or a download. Ask your agent to add one and give it the address.

Before anything changes, your agent shows you a review:

- what the module is and where it came from
- every file it would add, and where
- what it provides: a page, a button on the rail, entries in prototype menus, rules for agents
- any npm packages it needs, which are installed only if you say yes
- for a module built around an open source library: that library's license

Nothing changes until you say yes. A module is code that will run in your app, so treat it like any code you'd put in the repo: read it, or ask your agent to, and only add modules from people you trust. A module can't overwrite your files, and if a check fails after it's added, everything is put back.

## Remove a module

"Remove the Quote wall module" deletes its folder and the rules it brought. Anything it kept for you, like the tools in `src/tools/`, stays unless you ask to delete that too. If prototypes use a library the module provides, your agent tells you which, and you decide.

## Design systems work the same way

A design system is a folder in `src/systems/`. Adding one from a source, or starting a new one, uses the same review and the same rules. Adding a second system doesn't change which one your existing prototypes use: it records the current one as the default in `studio.config.ts` first.

## What you can change in the config

`studio.config.ts` is deliberately small: the app's name, a one-line tagline for the deployed site's front page, which optional modules are off, and the default design system. It's meant for the few things nearly every team changes. Everything else is code you own, and you can change anything in the repo.

To build a module of your own, see [Build a module](/guide/build-a-module).
