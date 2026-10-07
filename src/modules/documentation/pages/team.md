---
title: Personal & team use
description: Work alone or share a studio with contributors.
order: 5
toc: true
---

## What changes in team use?

New studios start in **Personal** mode. Your registered local contributor has Admin access, so you can manage the whole environment.

Switch **Studio settings → Studio use** to **Team** when you want contributor permissions. This enables Contributors & Permissions when installed. Ask your agent to install it if missing. Team studios require the module and at least one Admin.

Team mode organizes responsibility. It does not create a hosted editing service or live co-editing.

## Who can change what?

| Responsibility | Direct editing and management |
| --- | --- |
| Contributor | Their own prototypes. |
| System maintainer | Contributor access plus editing and renaming assigned active systems. |
| Admin | Shared settings, permissions, all prototypes, and system creation, defaults, archiving, restoration, and deletion. |

System maintainer is an assignment for a particular system, not a separate studio-wide role. Admins can manage systems without individual assignments.

Open **Contributors** locally to review people and assignments. Contributors can inspect the roster; Admins assign permissions. Archived systems must be restored before editing.

These permissions guide Studio and repository workflows. They do not authenticate people, grant GitHub access, or control who can view a published site.

## How does a teammate join?

Give them access to the team's repository through your Git host. Ask their agent to obtain a local copy, register their contributor identity, and open the existing studio. An Admin can then assign any additional permissions.

Each person works in their own local copy. Joining should preserve the team's systems, configuration, and existing work. See [Working environment](/documentation/manual/environment#how-do-i-join-a-team-studio).

## How do we share changes?

Use your team's Git workflow. **Git** records versions and exchanges file changes; your agent can handle its commands.

| Step | Effect |
| --- | --- |
| Save | Updates files in your local copy. |
| Commit | Records a version locally. |
| Push | Sends committed changes to the shared repository. |
| Pull | Brings shared changes into your local copy. |

Agree on who owns shared system changes and how they are reviewed. Let teammates know before changing foundations their prototypes use. If two people change the same files, the agent may need to reconcile conflicting edits.

Contributor assignments and repository access are separate. Ask your Admin or engineering partner to configure the team's review and repository protections.

## How do we include reviewers or engineers?

Publish a viewing link for people who only need to explore the work. Give working-file access when someone needs to inspect or develop the code.

Include intended behavior, simulated actions, and unresolved decisions in a handoff. See [Publishing & Home](/documentation/manual/share#what-should-reviewers-or-engineers-receive).
