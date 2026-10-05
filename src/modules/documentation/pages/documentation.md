---
title: "Documentation"
description: "Find human guidance and detailed platform contracts."
section: "Studio"
order: 14
module: documentation
toc: true
---

Documentation has two tabs: **Guide** and **Reference**.

## Guide

The Guide introduces the main surfaces and essential concepts. Read what is useful now; you do not need to finish it before making a prototype.

## Reference

Reference exposes the documentation beside the platform code. **Understand Studio** explains responsibilities and agent context. **Operate Studio** covers configuration, editing, assets, checks, and publishing. **Capabilities** covers individual modules. **Extend Studio** holds developer contracts and the tech stack. Navigation labels match the titles of the pages they open.

Your agent can consult these files for implementation details. You can inspect them when you want to understand how something works, but they are not required reading for everyday design work.

## How it relates to Systems

Reference presents the technical system of record: core contracts define shared platform behavior, and module contracts define individual capabilities. These files can state requirements as well as explain how things work.

Platform, modules, and systems each own context and skills. Context preserves knowledge and standing requirements; skills provide task procedures. Technical contracts stay beside their implementation and appear in Reference.

For example, a prototype contract defines permitted dependencies. The Prototypes module’s build-prototype skill tells an agent to read that contract, preserve your work, and verify the result. Your assigned product system adds its own context and conventions within these boundaries.

Read [Responsibilities](/documentation/reference/platform/core/contracts-and-instructions.md) for the ownership model, or [Agent context](/documentation/guide/agent-context) for the reading flow. [Systems](/documentation/guide/systems) exposes each system's components, theme, context and skills.

Use navigation for the [shared source workflow](/documentation/guide/home#working-with-files). Platform documentation does not offer rename or delete actions in these menus.
