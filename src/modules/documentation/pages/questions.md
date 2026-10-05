---
title: "Common questions"
description: "A few practical answers before you go further."
section: "More"
order: 40
toc: true
---

## Do I need to write code?

You can describe changes to your coding agent and review them in Studio. The source is always available when you want to inspect or edit it.

## What is it built with?

The platform uses React, TypeScript, Vite, TanStack Router, and Tailwind CSS. The starter components use shadcn/ui and Base UI. Your product system can use another component library. See [Tech stack](/documentation/reference/platform/context/technical/stack.md).

## Can I use our design system?

Yes. Ask your agent to bring in your components, tokens, and assets. Systems can support light mode, dark mode, or both. Start with [Systems](/documentation/guide/systems).

## Where do fonts, logos, and images go?

Keep prototype-specific assets with that prototype, system assets with their system, and shared studio assets in the shared assets location. Your agent can follow the [Assets and fonts](/documentation/reference/platform/context/technical/assets.md).

Asset Guard checks asset sizes before commits and in repository checks to catch large files before they slow down the codebase.

## Can we change the starter?

Yes. Admins can change the studio name, defaults, and enabled optional modules in [Studio settings](/documentation/guide/customize#configure-the-studio). You own the repository, so you can also ask your agent to adapt systems or add capabilities. Detailed contracts live in [Context and Skills](/documentation/context/platform.core); you do not need to read them to start.

## What if something breaks?

Copy the error message and give it to your agent, along with what you were trying to do. It can inspect the files and run the platform checks. [Checks and fixes](/documentation/reference/platform/context/technical/checks.md) provides the technical details.
