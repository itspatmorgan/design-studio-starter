---
title: "Set up your design system"
description: "Bring your components and tokens into the studio."
section: "Begin"
order: 3
toc: true
---

The starter includes **Product**, an example design system. It lets you try the environment before bringing in your own kit.

A design system supplies reusable components and tokens: named values for colors, typography, spacing, and other design choices. Each prototype uses one assigned system.

## Give the agent your source material

Ask: “Set up our design system.” Provide the component source or package, its dependencies, design tokens, and any usage guidance you have.

The `setup-design-system` skill guides the agent through importing the kit, scoping its theme and pop-ups, documenting components, and checking the result. It should ask for missing materials or decisions.

This is a shared platform change. Setup should be directed by the studio maintainer.

## Review the result

Open **Systems** to inspect foundations, component descriptions, props, and live examples. Check representative components in a prototype, including pop-ups and both color modes when supported.

Keep Product until the replacement works and retained prototypes no longer depend on it. The agent can then retire the placeholder and its sample content as part of the setup.

Changing the default does not migrate existing prototypes. Their imports and system choice must change together.

For ongoing component documentation and additional systems, see [Manage design systems](/documentation/guide/systems).
