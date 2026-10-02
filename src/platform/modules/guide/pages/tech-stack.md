---
title: "Tech stack"
description: "Find the frameworks and libraries used by the starter."
section: "Reference"
order: 41
toc: true
---

This reference is for maintainers and people who want to inspect or extend the code. Your agent can use these projects' documentation.

## App and build

| Project | Purpose |
| --- | --- |
| [React](https://react.dev) | User interface. |
| [TypeScript](https://www.typescriptlang.org) | Type checking for `.tsx` views and platform code. Plain `.jsx` views are also supported. |
| [Vite](https://vite.dev) | Local dev server and production build. |
| [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview) | App routes and URLs. |
| [react-error-boundary](https://github.com/bvaughn/react-error-boundary) | Recovery from view rendering errors. |

Routes live in `src/platform/app/router.tsx`.

## Components and styles

The starter uses [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com) components built on [Base UI](https://base-ui.com).

Starter components use Base UI's `render` prop for composition. Replacement design systems can use different component APIs.

[HugeIcons](https://hugeicons.com) supplies platform icons. [Lucide](https://lucide.dev) supplies starter product icons. The platform uses [Inter](https://rsms.me/inter/).

## Documents and canvases

[MDX](https://mdxjs.com) compiles plain Markdown. [Shiki](https://shiki.style) highlights code. [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) styles document pages.

The canvas module uses [Excalidraw](https://excalidraw.com). It loads when a canvas opens.

## Local tools and checks

[Mise](https://mise.jdx.dev) pins [Node](https://nodejs.org) and [pnpm](https://pnpm.io) versions. [Husky](https://typicode.github.io/husky/) runs local Git hooks.

[GitHub Actions](https://docs.github.com/en/actions) runs scope, asset-size, and build checks for pull requests and pushes to `main`.

## Built site

The production build is a static site in `dist/`. A host must serve `index.html` for app paths that do not identify an asset.

See the repository README for fallback examples. Hosting configuration and access control are the studio maintainer's responsibility.
