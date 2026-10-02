---
title: Design Studio personas
description: The intended users of Design Studio, the support they need, and the team contexts the starter kit should serve.
toc: true
---

These describe Design Studio's intended users, based on the creator's product direction. They are working audience profiles, not validated research personas. Goals and support needs below should be refined through use and conversations with real users.

They also demonstrate how a studio owner can give their agent useful product context. When adapting this kit, revise or replace this document with the people your own product serves. An agent building a team's product should not assume that its users are Design Studio's users.

## Primary: the designer who is building

This person has design judgment and familiarity with product development, and is taking on more implementation through agents. They want to move from an idea to something people can use and discuss. Their experience writing and maintaining software may be limited; it should not be a prerequisite for directing good work.

**Goals:** create prototypes with the team's actual high-fidelity components, sketch ideas on a canvas, explore wireframes, and connect those explorations to working code. Compare alternatives and refine the details through direct edits and agent direction.

**Support to provide:** a strong component and token foundation, reliable rendering, and clear connections between code prototypes and the other design surfaces alongside them. The agent handles implementation and verification so the designer can review visual details, states, and behavior.

**Friction to investigate:** repeated setup, prototypes that drift from the real product, disconnected artifacts, and needing to understand platform internals before making a design change.

**A successful first session:** the designer creates a prototype with their team's actual components, or sketches and wireframes an idea alongside a code prototype, then can direct the agent to connect and refine the work.

## Primary: the product manager who is building

This person understands product goals, customer problems, and team priorities, and is beginning to express more of that thinking through working software. They are familiar with technology and product development, but may need support with both implementation and interaction design.

**Goals:** turn a product idea into a tangible prototype, communicate it to the team, discuss the proposed experience, and get feedback on something people can interact with.

**Support to provide:** an agent that turns intent into a coherent flow, asks focused questions about unresolved behavior, and explains design choices in plain language. Useful defaults and reusable patterns should help them reach a reviewable result while leaving decisions open to refinement.

**Friction to investigate:** starting from an empty page, uncertainty about what context to supply, and a prototype that looks complete while important behavior or assumptions remain unclear.

**A successful first session:** the product manager turns an idea into a prototype they can use to communicate with the team, discuss the flow, and gather feedback on a tangible asset.

## Tertiary: the engineer collaborating with the team

This person contributes engineering knowledge to the product team's work. Engineers may inspect, extend, or help maintain the studio, but they are not the primary audience for its first release. Their potential use may expand as the platform develops.

**Goals:** understand the intended behavior, assess feasibility, connect prototypes to existing components and code, and help the team adapt or maintain its environment.

**Support to provide:** readable code, clear module and dependency boundaries, reproducible local setup, and visible context behind design decisions. Make it possible to inspect and change the implementation using familiar development tools.

**Friction to investigate:** unclear ownership, prototypes that hide assumptions, and tightly coupled customization that makes the studio difficult to maintain.

**Success looks like:** the engineer can understand and contribute to the work without having to reconstruct its context or repair the environment first.

## The team and the studio owner

The intended setting is a software product team, especially at a startup, with smaller teams within larger companies also a possibility. Sublime is the creator's own team context. Suitability across other company sizes and environments still needs validation.

The studio owner is a responsibility that one of these people may take on, rather than a separate profession. They establish the studio's configuration, design system, shared context, and contributor conventions. Additional contributors need to join that environment without repeating initialization or replacing decisions the team has already made.

Company environments vary widely. A team needs to bring the studio into its own stack and customize it around its codebase and practices. Individual users need the same creative capabilities and ownership, with a simpler collaboration setup.

## Questions to validate

- Which tasks bring designers and product managers into the studio first, and where do their support needs differ most?
- How much implementation and design experience do users bring, and which explanations help them act confidently?
- Who usually takes responsibility for initialization, the design system, and ongoing studio maintenance?
- Which parts of the workflow require direct human editing, and which can the agent carry through reliably?
- What changes when a personal studio becomes shared, or when a small team's studio grows?

## Using these personas

Evaluate the core workflow first for designers and product managers, with engineers as supporting collaborators. Use the [principles](principles.md) to judge the quality of the experience. Refer to a person's actual goals and experience when available; these profiles should guide questions, not replace what the person tells you.
