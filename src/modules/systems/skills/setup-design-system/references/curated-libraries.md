---
title: Curate from libraries
description: Select a small library kit for an intended prototype without replacing unrelated systems.
---

## Define the first useful kit

Translate the intended prototype into a short inventory: screens, interactions, states, required components, and visual foundations. Reuse suitable installed components before adding more. Include supporting dependencies needed by selected components, but do not import an entire catalog.

Show the proposed kit and its purpose. Let designers specify components and theme details directly. Help product managers review the flow and visual direction without requiring them to choose technical primitives.

## Import selected components

Read the source library's current official documentation and inspect installed CLI help before choosing commands:

- [shadcn CLI](https://ui.shadcn.com/docs/cli) and [configuration](https://ui.shadcn.com/docs/components-json).
- [Untitled UI CLI](https://www.untitledui.com/react/docs/cli).

1. Inspect `components.json`, aliases, CSS destinations, dependencies, and the chosen system's declaration. The root configuration may target Product components and Studio CSS. A component output path alone does not redirect CSS or dependency writes.
2. Preview proposed changes when supported. If a CLI cannot isolate every write, generate in a temporary workspace and integrate selected files deliberately. Do not run library initialization over the existing studio.
3. Select components by name. Review transitive dependencies, global CSS, fonts, and license or account requirements. Use material the person can access and is authorized to use.
4. Adapt imports, scoped tokens, portals, and assets to the system contract. Preserve component APIs. Document intentional adaptations and the upstream version or revision.
5. Verify required states in examples and one representative prototype. Add components or tokens when that work demonstrates a gap.

Do not use bulk installation, overwrite existing components, or apply a global theme preset merely to accelerate setup. Starter systems demonstrate integrations; their presence does not prove every upstream component already works here.

## Return to the workflow

Return to Setup Design System for documentation, registration, default changes, migration, and verification. Leave existing prototypes and starter systems available until the person chooses their disposition.
