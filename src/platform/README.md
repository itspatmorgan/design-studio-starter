# Design Studio platform

The platform connects prototypes, modules, and design systems. Start here to find its knowledge, workflows, and implementation.

## Context

- [Principles](context/principles.md) and [Personas](context/personas.md): product direction and intended users.
- [Working in Studio](context/working-in-studio.md) and [Contributor scope](context/contributor-scope.md): standing requirements for agent work and preserving ownership.
- [Documentation standards](context/documentation-standards.md): writing and source ownership.
- [Responsibilities](context/contracts-and-instructions.md) and [Agent context routing](context/agent-context.md): how context and skills are owned, discovered, and read.

All platform knowledge and requirements live together in `context/`:

| Subject | Source |
| --- | --- |
| Configuration and roles | [Configuration](context/config.md) |
| Modules and extensions | [Module contract](context/modules.md) |
| File formats and lifecycle | [File types](context/file-types.md) |
| Editing and saving | [Source workflow](context/source.md) |
| Assets and fonts | [Assets](context/assets.md) |
| Validation and recovery | [Checks](context/checks.md) |
| Deployment | [Publishing](context/publishing.md) |
| Shared diagram rendering | [Diagrams](context/diagrams.md) |
| Implementation dependencies | [Stack](context/stack.md) |

## Skills

- [Configure studio](skills/configure-studio/SKILL.md): configure a running studio.
- [Setup contributor](skills/setup-contributor/SKILL.md): join an existing studio.
- [Manage modules](skills/manage-modules/SKILL.md): install or change capability availability.
- [Maintain context](skills/maintain-context/SKILL.md): author shared knowledge and procedures.
- [Maintain documentation](skills/maintain-documentation/SKILL.md): revise or audit guidance.

## Implementation

`core/` holds shared APIs and runtime boundaries. `app/` holds the application shell and shared readers. Markdown knowledge lives in Context; task procedures live in Skills.

Each module and system has its own README entry point, context, and relevant skills. A README is technical context at the owner's front door. Skills consult authoritative context rather than copying contracts.

The Documentation surface offers a curated Guide and a platform and module Context and Skills browser. The browser displays these original files. System context and skills appear within each system’s UI alongside its components and theme. Generated harness entries route agents back to the canonical skills.
