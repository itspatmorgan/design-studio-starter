---
title: "Introduction"
description: "Your own environment for design work with an agent."
section: "Begin"
order: 1
toc: true
---

Design Studio is a workspace for designers and product managers who build with coding agents. Use it on your own or with a team. You own the code, your context, and the designs you create.

You direct the work. Your agent performs setup, builds prototypes, and checks changes. You can also edit files and use the studio's editing surfaces directly.

## An opinionated starting point

The starter brings together a selected toolkit so you can begin with fewer setup decisions. Its recommended setup is:

- React and TypeScript for code-based prototypes.
- Tailwind CSS for styles.
- shadcn/ui components built on Base UI for the starter design systems.
- Git for version history and GitHub for the included collaboration checks.
- A coding agent that can read repository instructions, edit files, and run local commands.

This is the combination the kit's creator uses for personal projects and team work. It is the recommended path for the most complete experience out of the box.

The platform depends on its core stack. Prototype design systems can use other component libraries. Other agents and Git hosts may need adapted instructions or checks.

You own the code and can adapt it through modules, configuration, or direct changes. You maintain those adaptations. The starter does not provide integrations for every tool or environment.

See [Tech stack](/guide/tech-stack) for the dependencies and replaceable defaults.

## What the studio provides

![Shared design systems and Handbook context support each contributor's independent prototypes.](/guide/studio-parts.svg)

| Part | What it provides |
| --- | --- |
| Prototypes | Independent spaces for interactive code-based views and local experiments. |
| Design systems | Components and tokens that help views match your product. |
| Documents and canvases | Optional written context and visual arrangements beside views. |
| Handbook | Shared context for people and instructions for agents. |
| Modules | Defined places to add, disable, or remove platform capabilities. |

The defaults give you a working toolkit. You can replace them or extend the environment. A prototype can use its design system, start from a blank view, or combine both approaches.

## Files are the working environment

A repository is the project folder whose versions Git tracks. The local app reads its files. Changes made by you or your agent appear while the studio runs. Git records versions and shares changes between local copies.

Publishing produces a site for viewing the work. Local use does not require hosting. Sharing files through Git and publishing a site are separate operations.

## Read this Guide

Read from setup through creation, maintenance, and collaboration, or select a chapter from the sidebar. Reference pages contain file conventions and implementation details.

You can also edit the Guide locally. See [Edit the Guide](/guide/handbook#edit-the-guide).
