---
title: Design Studio personas
description: Design Studio's intended users and engineering partners, the support they need, and the team contexts the starter kit should serve.
toc: true
---

These describe Design Studio's intended users and engineering partners, based on the creator's product direction. They are working audience profiles, not validated research personas. Goals and support needs below should be refined through use and conversations with real users.

These belong to the Platform system. Keep your own product personas in the assigned system’s context folder. An agent building a team's product should use that system’s audience context rather than assuming its users are Design Studio's users.

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

## Engineering partner: the design-system provider and handoff recipient

Engineers are important to Design Studio even when they do not use it directly. They connect the studio to production engineering at two points: the design-system code it ingests during setup, and the prototype a designer or product manager hands off afterward.

### During setup: provide the design-system code

The engineer is responsible for the actual design-system code the studio uses. Designers and product managers need to prototype with those components and tokens, so the results reflect the team's real product.

**Support to provide:** a clear path for bringing existing components, tokens, and dependencies into the studio. Keep any adaptations understandable and preserve the connection to the source system so the team can maintain it as the product changes.

**Success looks like:** the team can build prototypes with its actual design system, and the engineer can understand how that code is incorporated and maintained.

### During handoff: understand and use the prototype

The engineer receives the prototype from a designer or product manager. Both the engineer and the engineer's agent need to understand its behavior, design intent, and supporting context, then use that material in the production engineering process.

**Support to provide:** readable prototype code, identifiable design-system components, and accessible context describing flows, states, decisions, assumptions, and unresolved questions. Make it clear which behavior is demonstrated, which is simulated, and which still needs a production decision.

**Friction to investigate:** missing intent, hidden assumptions, unclear component provenance, and a handoff that requires the engineer or their agent to reconstruct the work from screenshots or conversations.

**Success looks like:** the engineer and their agent can inspect the prototype, understand the intended experience, identify what needs adaptation, and use it to inform production implementation. Handoff should not depend on the engineer becoming a regular Design Studio user.

## The team and the studio owner

The intended setting is a software product team, especially at a startup, with smaller teams within larger companies also a possibility. Sublime is the creator's own team context. Suitability across other company sizes and environments still needs validation.

The studio owner is a responsibility that one of these people may take on, rather than a separate profession. They establish the studio's configuration, design system, shared context, and contributor conventions. Additional contributors need to join that environment without repeating initialization or replacing decisions the team has already made.

Company environments vary widely. A team needs to bring the studio into its own stack and customize it around its codebase and practices. Individual users need the same creative capabilities and ownership, with a simpler collaboration setup.

## Using these personas

Evaluate the creation workflow first for designers and product managers. Evaluate setup and handoff for the engineers who provide the design system and receive the work, including whether their agents can understand and use it. Use the [principles](principles.md) to judge the quality of the experience. Refer to a person's actual goals and experience when available; these profiles should guide questions, not replace what the person tells you.
