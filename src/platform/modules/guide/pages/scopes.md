---
title: "Scopes"
description: "Who can change what, and the checks that keep it that way."
section: "Core concepts"
order: 12
toc: true
---

Two rules let a whole team work in one repo without stepping on each other.

## Contributor scope

> You can change anything in your folder, but only your own folder. Everything else is the platform.

Each person has an entry in `contributors.json` or `contributors/<key>.json` and a folder in `src/prototypes/`. Your folder is yours to break. The platform, meaning the app, the systems, the scripts, the [Handbook](/guide/handbook), and this Guide, is shared, so changes there should go through whoever maintains it.

It works like an open source project. Anyone can propose a change to the platform: make it on a branch, and open a pull request. The maintainer decides what goes in.

The scope check sorts every changed file into one of two buckets: your folder, or the platform.

- **Before you commit and push,** it prints a summary. It never blocks you, and your agent tells you when something is outside your folder.
- **On pull requests,** GitHub checks the build and flags platform changes for maintainer review.
- **On every push to main,** platform changes pass only when the pushing account has the repository's `admin` or `maintain` role. Other accounts can push changes within their contributor scope. Deployment waits for these checks.

The studio maintainer should protect `main`, require pull requests and the Checks jobs, and require maintainer review for shared code. The starter does not configure GitHub branch protection for you.

A [tool](/guide/tools) is a team asset, so it doesn't live in anyone's folder. It's in scope for the people listed as its `maintainers`, and only for them. The scope check uses the list from before the change, so a change can't make its author a maintainer.

Adding or editing your own entry in `contributors.json` or `contributors/<key>.json` counts as in scope. Before each commit, you'll also get a warning if your Git name or email doesn't match your entry, so your commits trace back to you.

## Prototype scope

> A prototype can depend only on its own folder, its design system, and shared utilities.

A prototype can import from its own folder, its design system (`src/systems/product/` unless it picks another), and `src/lib/`. It can't import from another prototype or a [tool](/guide/tools), so nobody's change breaks your work, or from `src/platform/`, so the app can change freely. To reuse something from one, link to it or ask your agent to copy it into your folder.

It also can't import from a different design system than the one it picks in `meta.json`, so its look stays consistent.

The import guard enforces this. It warns while the app runs, and fails the build.

Styles stay contained too. Use Tailwind classes, or CSS Modules (`*.module.css`) for custom CSS. A plain `.css` file would restyle the whole app, so the build fails if a prototype imports one. Each design system's theme is checked the same way: every value has to sit under its own class, like `.product-theme`.

## Keeping the repo fast

Git keeps every version of every file forever, so one oversized image makes every future clone slower for everyone. Any file over 750 KB is blocked when you commit, and fails the check on push. Export images as WebP or compressed JPEG, at the size they're shown. If your agent hits the limit, it will shrink the file for you.
