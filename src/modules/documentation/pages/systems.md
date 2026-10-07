---
title: "Systems"
description: "Choose a toolkit or bring your own components and theme."
section: "Studio"
order: 12
module: systems
toc: true
---

A system gives your prototypes shared components, theme, assets, and instructions for your agent.

## Choose a system

Open **Systems** to explore the available toolkits. **Product** and **Marketing** are examples you can use, adapt, or replace. **Studio**, marked **Platform**, powers Design Studio itself and is required; it is unavailable for prototypes.

The **Default** badge marks the starting choice for new prototypes. Each prototype uses one system, or **None**, and can have its own local components and styles.

## Bring your own system

Build and manage your system with your agent. It handles the setup work. Use Studio to review the results and give feedback.

1. Click **New system** and name it. This creates a blank system with no components, theme tokens, or assets. Existing systems and prototypes stay unchanged.
2. On its overview, choose **Curate a toolkit from open libraries** or **Bring my own system**.
3. Copy the displayed prompt into your coding agent’s chat, then tell it what you want to prototype.

**Starting from an idea?** Describe the experience, such as a customer feedback dashboard. Your agent can select a small toolkit from shadcn or Untitled UI. You can also specify the components and visual choices yourself.

**Have an existing React system?** Share its source or package. Your agent assesses the components, theme, fonts, icons, and dependencies before importing. Review any differences from the original; application dependencies may need your engineer’s help.

Create systems locally as an Admin. In personal use, your registered contributor is the Admin. You can keep exploring with the examples while preparing your own system.

## What belongs in a system?

| Part | Use it for |
| --- | --- |
| Theme | Shared colors, typography, spacing, and other visual choices. |
| Components | Reusable interface pieces, with live examples and properties. |
| Assets | Shared fonts, icons, logos, and images. Package assets may not appear as local files. |
| Context | Your product’s users, goals, research, and requirements. |
| Skills | Instructions for specific recurring agent tasks. |

Add context and skills when they help; you can start without them. System changes are shared across your team. Assets or overrides used by only one prototype can stay with it.

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
