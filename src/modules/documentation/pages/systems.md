---
title: "Systems"
description: "Give your prototypes your product's components, styles, and knowledge."
section: "Your studio"
order: 20
module: systems
toc: true
---

A system is the reusable foundation for your prototypes. It brings your design toolkit and product knowledge together so your agent can build work that fits your product.

You can use the same system across many prototypes. Establishing your own system is usually the most valuable way to customize Studio.

## Choose a system

Open **Systems** to explore the available toolkits. **Product** and **Marketing** are examples you can use, adapt, or replace. **Studio**, marked **Platform**, powers Design Studio itself and is required; it is unavailable for prototypes.

The **Default** badge marks the starting choice for new prototypes. Each prototype uses one system, or **None**, and can have its own local components and styles. Its sidebar shows the assignment. Browsing another system does not change it.

## Bring your own system

Ask your agent to create or adapt a system. It handles the setup; you review the components and representative screens.

Choose a starting point based on what you have:

| What you have | What to give your agent |
| --- | --- |
| An existing React design system | Its source or package, usage examples, theme, assets, and known dependencies. |
| Brand guidance or visual references | Fonts, colors, logos, screenshots, and an explanation of what should carry through. |
| An idea without an established toolkit | The experience, audience, and visual direction you want to explore. |

Visual references can guide a new toolkit; they do not supply your team's actual component implementation. If you want production components, ask an engineering partner for their source or package. Components coupled to application services may need adaptation.

For example:

> Help me set up a system for our product using these components and brand materials. Assess what can be reused, explain gaps or adaptations, and propose a small starting toolkit. Then build a representative screen for me to review.

If you prefer to start from Studio's controls:

1. Click **New system** and name it. This creates a blank system with no components, theme tokens, or assets. Existing systems and prototypes stay unchanged.
2. On its overview, choose **Curate a toolkit from open libraries** or **Bring your own system**.
3. Copy the displayed prompt into your coding agent’s chat to begin.

Your agent can curate a toolkit from shadcn/ui or Untitled UI, or assess your own React system. Review the proposed scope, visual choices, and any dependencies together.

Create systems locally as an Admin. In personal use, your registered contributor is the Admin. You can keep exploring with the examples while preparing your own system.

## What belongs in a system?

| Part | Use it for |
| --- | --- |
| Theme | Shared colors, typography, spacing, and other visual choices. |
| Components | Reusable interface pieces, with live examples and properties. |
| Assets | Shared fonts, icons, logos, and images. Package assets may not appear as local files. |
| Context | Your product’s users, goals, research, and requirements. |
| Skills | Instructions for specific recurring agent tasks. |

Add context and skills when they help; you can start without them. [Product knowledge](/documentation/guide/agent-context) explains what to supply and where to keep it. Assets or overrides used by only one prototype can stay with that exploration.

## Review your system in use

Try a representative screen with the new system. Check typography, spacing, colors, important component states, and the supported light or dark appearances. Tell the agent where the result differs from your product.

System changes are shared across the prototypes using it, so review affected work when changing reusable components or styles. In a team, coordinate those changes with the system's maintainers.

Setting a new default does not rebuild existing prototypes. To compare an existing exploration with another system, use a [rebuild copy](/documentation/guide/prototypes#explore-another-system).

## Manage a system

Use the **…** menu on a system’s card or beside its name. Admins can change prototype systems.

| Action | What happens |
| --- | --- |
| Rename | Updates the name, folder, and references. A brief toast confirms the update; remaining references needing review are flagged. |
| Set as default | Changes the starting choice for future prototypes. Existing assignments stay the same. |
| Archive | Keeps files in the repository, archives associated active prototypes, and excludes them from deployment. The system becomes unavailable for new prototypes. |
| Restore | Makes the system available again. Choose whether to also restore prototypes archived with it. |
| Delete | Permanently deletes system files. Associated prototypes keep their files but need another system and a rebuild before they work. There is no Studio recovery copy. |

Choose another default before archiving or deleting the current one. Archived systems offer only **Restore** and **Delete**.
