---
title: "Static assets"
description: "Where fonts, logos, and shared images belong."
section: "Learn more"
order: 43
toc: true
---

## Keep assets with their owner

Your product's brand fonts, logos, and reusable imagery usually belong to its design system. This makes them available to every prototype using that system.

Keep images for one experiment inside that prototype. Assets intended for reuse across different systems can live in the shared library. Studio UI assets belong to the platform.

See the [static asset convention](../../../core/assets.md) for the directory map, import examples, and scope boundaries.

## Use imports by default

Ask your agent to import images into views and reference font files from the scoped system theme. The build handles their production URLs.

Use the repository's `public/` directory for fixed URLs, such as the favicon. Public files are served across the site and retain their filenames.

These are supporting files, rather than prototype artifacts. In a prototype, **Show all files** exposes them locally.

## Asset Guard

The pre-commit Asset Guard blocks oversized files before they enter the repository. If it flags an asset, ask your agent to resize or compress it, then stage the smaller version.

See [Asset Guard](../../../core/assets.md#asset-guard) for the limit, hook, and CI behavior.
