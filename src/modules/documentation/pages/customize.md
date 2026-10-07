---
title: Customize your studio
description: Make Studio fit your product, then extend it when you need more.
section: Your studio
order: 23
toc: true
---

The most useful customization is usually your own design system. Its components, styles, and product knowledge help your agent make work that feels like your product. Start with [Systems](/documentation/guide/systems#bring-your-own-system).

You own Studio's code too. Your agent can change the environment or add capabilities as your needs grow.

## Choose where to work

| What you want | Where the change belongs |
| --- | --- |
| Try a different layout or interaction | In your prototype. |
| Reuse components, styles, or product guidance | In a system. |
| Change the studio name, defaults, or available tools | In Studio settings. |
| Add a new tool or section | In a module where practical. |
| Change Studio's core experience | In the supplied application code. |

Start with the smallest change that serves your goal. An experiment can stay inside a prototype until it needs to become a shared pattern.

## Configure the studio

Ask your agent to help configure Studio, or open **Studio settings** from the local gear icon or search. Registered contributors can view settings; Admins can edit shared choices. In personal use, your local contributor is automatically an Admin.

| Section | What you can do |
| --- | --- |
| General | Change the name, tagline, personal or team use, and default design system. |
| Modules | Turn installed optional capabilities on or off. Required capabilities stay enabled. |

Changing the default system affects the starting choice for new prototypes. Existing prototypes keep their assignments. Disabling a module preserves its files and content so you can enable it later.

Choose **Save changes** to apply edits. Studio saves locally and restarts to apply the configuration. **Discard** resets unsaved edits. If your agent changes settings while you are editing them, reload before saving.

Switching to Team enables Contributors & Permissions when it is installed. If it is missing, ask your agent to install it first. Use the separate **Contributors** page to review profiles and assignments. Ask your agent to help register teammates and establish access. When that module is enabled, the **Collaborate** chapter explains roles and ownership.

A local save does not share or publish changes. See [Share and hand off](/documentation/guide/share).

## Add a system

Ask your agent to create or adapt a system for your product. You can have several systems, such as a product interface and a marketing site, and choose one for each prototype.

Changes to a shared system can affect the prototypes using it. Review the relevant screens after changing components or styles, and agree on shared changes with your team.

## Build a module

A **module** adds a capability to Studio, such as an artifact type or a new section. Modules can keep a feature's code together and integrate through supported connections to the platform.

For example:

> We want a Research section for browsing interview summaries. Assess whether this fits as a module. Explain what it would contain, what it needs from Studio, and how we would maintain it before building it.

Your agent can scaffold the module, build its behavior, and check its integration. You review whether it solves the intended problem. Installed optional modules can be turned on or off in settings.

Module boundaries reduce accidental coupling with the core. Modules still run as part of Studio; a faulty module can affect the application. Ask your agent to use the supported [module contracts](/documentation/context/platform.core/context/modules) and make the result reviewable.

## Adapt supplied code

Your agent can change Studio's appearance or behavior when settings and modules do not cover the need. Explain the outcome you want and ask it to identify the scope before making a substantial change.

Changes to shared code need coordination in a team. Preserve why a change was made so it is easier to assess future updates.

## Accept upstream updates

Studio does not automatically merge future releases into your folder. Ask your agent to compare an update with your local changes, preserve your work, and verify the application before adopting it.

Your custom systems and modules need ongoing maintenance too. For deeper setup and update details, your agent can consult [Studio configuration](/documentation/context/platform.core/context/config) and [Modules and extensions](/documentation/context/platform.core/context/modules).
