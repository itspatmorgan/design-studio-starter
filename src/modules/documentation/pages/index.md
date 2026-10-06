---
title: "Introduction"
description: "A workspace for designing with your coding agent."
section: "Begin"
order: 1
toc: true
---

Design Studio brings your prototypes, design system, and team context into one workspace. You own its files and the work you create. Use it on your own or with a team.

You do not need to understand the whole platform to begin. Start with the sample prototype, then ask your coding agent to help create your own.

## Your work and shared capabilities

Your prototypes are independent working areas. Systems and platform capabilities support the whole studio. Coordinate changes to these shared capabilities with your team.

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 20, "rankSpacing": 30, "subGraphTitleMargin": {"top": 10, "bottom": 15}}}}%%
flowchart TB
  accTitle: Studio ownership and safe working areas
  accDescr: Platform infrastructure composes modules that provide studio capabilities. Each system owns theme, components, context and skills. Contributor-owned prototypes use an assigned system and contain artifacts for local experiments.
  platform[Platform infrastructure]
  modules[Modules<br/>Studio capabilities]
  subgraph system[System scope]
    ui[Theme<br/>and components]
    knowledge[Context and Skills]
  end
  subgraph yours[Prototype scope: your experiments]
    artifacts[Views, documents,<br/>diagrams, and canvases]
  end
  platform -->|Composes| modules
  modules -->|Provides capabilities| system
  modules -->|Provides capabilities| yours
  ui -->|Components and tokens| artifacts
  knowledge -.->|Guides people and agents| yours
```

These boundaries describe collaboration scope. Your contributor area is the default place for independent work. Modules provide capabilities; system knowledge guides people and agents rather than creating a code dependency. Documents, diagrams, and canvases are optional capabilities.

## Working with your agent

Open the same repository in your coding agent and run Studio alongside it. Describe what you want to explore. The agent changes files; Studio lets you see and interact with the result.

```mermaid
sequenceDiagram
  accTitle: A person and agent refine a prototype
  accDescr: A person supplies intent. The agent reads relevant repository context, builds and checks the work, and presents it for review. The person directs revisions or accepts the result.
  actor Person
  participant Agent as Coding agent
  participant Repo as Repository files
  Person->>Agent: Describe outcome and supply context
  Agent->>Repo: Read relevant instructions and current files
  Repo-->>Agent: Guidance and working material
  Agent->>Repo: Build and check changes
  Agent-->>Person: Present result and remaining questions
  opt Further refinement
    Person->>Agent: Direct the next change
    Agent->>Repo: Revise and check
    Agent-->>Person: Present updated result
  end
  Note over Person,Agent: The person can also edit the work directly
```

This shows one iteration. Checks can fail, and the agent may need clarification before it builds.

The [Agents section](/documentation/guide/agent-context) explains how to give your agent useful direction and shared knowledge, then refine both through your work.

Give the agent your goals, constraints, and feedback. You can work visually while it handles code and technical details.

## Find your way around

| Surface | What you do there |
| --- | --- |
| [Home](/documentation/guide/home) | Find work and search the studio. |
| [Prototypes](/documentation/guide/prototypes) | Explore ideas using screens, writing, diagrams, and canvases. |
| [Systems](/documentation/guide/systems) | Browse components, styles, context and skills for your prototypes. |
| [Documentation](/documentation/guide/documentation) | Read this Guide or browse Context and Skills. |

Run Studio locally to make changes. You can also publish a viewing site when you want to share your work.

## Make the studio your own

Start with prototypes, then configure the studio, add systems, or build modules. [Customize your studio](/documentation/guide/customize) explains these scopes and the responsibility for future updates.
