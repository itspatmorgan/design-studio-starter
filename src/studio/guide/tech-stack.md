---
title: "Tech stack"
description: "What the kit is built with, and where to find each tool's docs."
order: 3
toc: true
---

Every tool here is open source and popular. That matters for two reasons: you can change anything, and agents know these tools well, so they use and troubleshoot them better. When you have a question about one of them, its own docs are the best answer.

## The app

- [React](https://react.dev) for the UI
- [TypeScript](https://www.typescriptlang.org), in strict mode. New views are `.tsx`. Plain `.jsx` views still work; they just aren't type-checked.
- [Vite](https://vite.dev) for the dev server and build
- [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview) for URLs. Routes live in `src/studio/app/router.tsx`.
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary), so one broken view can't take down the app

## Styling and components

- [Tailwind CSS](https://tailwindcss.com) for styling
- [shadcn/ui](https://ui.shadcn.com) components, built on [Base UI](https://base-ui.com/react/overview/quick-start). Compose them with the `render` prop, not Radix's `asChild`, which most examples online still use.
- [HugeIcons](https://hugeicons.com) for the app's own icons, and [Lucide](https://lucide.dev) for product components and prototypes
- [Inter](https://rsms.me/inter/) for type

## The Guide

- [MDX](https://mdxjs.com)'s compiler, in plain Markdown mode, for these pages and prototype documents
- [Shiki](https://shiki.style) for code highlighting
- [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) for page styling

## Tools and automation

- [mise](https://mise.jdx.dev) pins the versions of [Node](https://nodejs.org) and [pnpm](https://pnpm.io), so everyone runs the same setup
- [Husky](https://typicode.github.io/husky/) runs the scope check before you commit and push
- [GitHub Actions](https://docs.github.com/en/actions) runs the same check, plus a build, on every push to main

## Hosting

The build is a static site in `dist/`, so it runs on any static host. Before you deploy, check who can see it, so you don't publish company work to the open internet by accident.

URLs are clean paths, like `/patrick/hello-world`. Set your host to serve `index.html` for every path. See [TanStack's history docs](https://tanstack.com/router/latest/docs/framework/react/guide/history-types), and the README for fallbacks.
