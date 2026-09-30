---
title: "Introduction"
description: "A shared place where designers and their coding agents build React prototypes side by side."
order: 1
---

Design Studio Starter is the kit behind Design Studio, the prototype sandbox I built for my team at Sublime Security. It's one repo where each designer gets their own folder, prototypes show up in a shared app automatically, and a few light checks keep one person's work from breaking anyone else's.

It's a starting point, not a finished product. Everything here is meant to be changed to fit your team.

## Three contracts

The whole sandbox rests on three agreements:

1. **A prototype is a folder.** Every prototype lives in its own folder, with a small `meta.json` that describes it.
2. **A script builds the manifest.** A script reads those folders and writes a list of every prototype and its views.
3. **The app reads the manifest and the URL.** The app lists what's in the manifest, and opens whichever prototype and view the URL points to.

Nothing else needs to know about anything else. That's what keeps it simple.

## Two scopes

Two rules keep it working as more people join:

- **Contributor scope.** You can change anything in your folder, but only your own folder. Everything else is the platform.
- **Prototype scope.** A prototype can depend only on its own folder, its design system, and shared utilities.

[Scopes](/guide/scopes) covers how they're enforced.

## Where to go next

- New here? Start with [Getting started](/guide/getting-started).
- Curious what it's built with? See the [Tech stack](/guide/tech-stack).
- Ready to build? Read [Prototypes](/guide/prototypes).
