---
title: Customize
description: Change settings, team access, or the capabilities of your studio.
order: 4
toc: true
---

## Where should a change go?

| You want to change… | Use… |
| --- | --- |
| One exploration's appearance or behavior | Its prototype. |
| Reusable components, styles, or product knowledge | A system. |
| The studio name, defaults, or enabled tools | Studio settings. |
| A new tool or section | A module where practical. |
| Studio's core appearance or behavior | Its application code. |

Your own [design system](/documentation/guide/systems) is usually the most useful customization. You also own Studio's code; your agent can adapt the environment.

## How do I configure the studio?

Open **Studio settings** from the local gear icon or search, or ask your agent. Registered contributors can view settings; Admins can edit them.

**General** controls the name, tagline, personal or team use, and default system. **Modules** enables or disables installed optional capabilities. Disabling preserves saved content. Changing the default system preserves existing prototype assignments.

Choose **Save changes** to save locally and restart Studio with the new configuration. **Discard** resets unsaved edits. If your agent changes settings while you are editing, reload before saving. Saving does not share or publish changes.

## How does team access work?

Personal use gives your local contributor Admin access. Switching to Team enables Contributors & Permissions when installed; ask the agent to install it if missing.

Ask your agent to register teammates in the existing studio. Use **Contributors** to review profiles and assignments. Admins assign access there.

| Responsibility | Can manage |
| --- | --- |
| Contributor | Their own prototypes. |
| System maintainer | Their own prototypes and assigned active systems. |
| Admin | Shared settings, permissions, systems, and all prototypes. |

Team studios need at least one Admin. These assignments organize local work; they do not grant Git repository access or provide sign-in. Coordinate shared changes and follow your team's review process.

## Can my agent add a feature?

Yes. A **module** keeps a capability's code together and integrates through supported platform connections. Ask your agent to assess whether a module fits, explain the scope, and build a reviewable result.

Modules reduce accidental coupling with Studio's core. They run as part of the application, so a faulty module can still affect it. Your agent can use the [module contracts](/documentation/context/platform.core/context/modules).

## How do I update a customized studio?

Studio does not automatically merge future releases into your folder. Ask your agent to compare an update with your local changes, preserve your work, and verify the application before adopting it. Custom systems and modules also need ongoing maintenance.
