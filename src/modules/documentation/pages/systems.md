---
title: Systems
description: Your reusable design toolkit and product knowledge.
order: 3
module: systems
toc: true
---

## What is a system?

A system brings together the shared foundation your agent uses across prototypes.

| Part | Contains |
| --- | --- |
| Theme | Colors, typography, spacing, and other visual choices. |
| Components | Reusable interface pieces with live examples. |
| Assets | Fonts, icons, logos, and images. |
| Context | Audience, goals, research, principles, and standards. |
| Skills | Instructions for recurring agent tasks. |

Open **Systems** to browse these resources. Product and Marketing are starter examples you can adapt or replace. **Studio**, marked **Platform**, powers Design Studio itself and is unavailable for prototypes.

## How do I bring in my own system?

Ask your agent to create or adapt one. Supply what you have:

| Starting point | Useful material |
| --- | --- |
| Existing React components | Source or package, usage examples, theme, assets, and dependencies. |
| Brand or visual direction | Fonts, colors, logos, screenshots, and what the references should influence. |
| No established toolkit | The experience, audience, and visual direction you want. |

The agent can assess your React system or curate a toolkit from shadcn/ui or Untitled UI. Review adaptations and gaps, then try representative screens. Visual references guide appearance; they do not supply your actual production components. Application dependencies may need engineering help.

To start through the interface, select **New system**. It creates a blank system. Choose **Curate a toolkit from open libraries** or **Bring your own system** on its overview, then copy the prompt to your agent. System creation requires local Admin access.

## Where do product knowledge and decisions go?

Keep knowledge that should guide many prototypes in the system's **Context**. Keep an exploration's brief, decisions, and open questions with its prototype.

Ask your agent to update existing guidance rather than create duplicate documents. Preserve sources and distinguish evidence from assumptions. Use **Skills** for recurring workflows; you do not need a new skill for each request.

You can review guidance in Systems and ask the agent to revise it. In a team, agree on shared changes together.

## What happens when I change a system?

Changes to shared components and styles can affect prototypes using that system. Review affected screens. Local experiments can stay inside a prototype until you want to share them.

The **Default** badge marks the starting choice for new prototypes. Changing the default preserves existing assignments. To rebuild existing work with another system, use a [rebuild copy](/documentation/manual/prototypes#can-i-try-another-appearance-or-system).

## How do I manage a system?

Use its **…** menu. Admins manage availability; assigned maintainers can edit their active systems and rename them.

| Action | Result |
| --- | --- |
| Rename | Updates the name, folder, and known references; remaining references are flagged. |
| Set as default | Changes the starting choice for future prototypes. |
| Archive | Keeps files, archives associated active prototypes, and excludes them from publication. |
| Restore | Makes the system available; optionally restores prototypes archived with it. |
| Delete | Permanently removes system files. Associated prototypes keep their source but require another system and a rebuild. Studio keeps no recovery copy. |

Choose another default before archiving or deleting the current one. Archived systems offer Restore and Delete.
