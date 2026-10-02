---
title: Project Context
description: What this project is for, who it serves, and what we've decided so far.
toc: true
---

This is the kind of document you write once and point everyone at, including your agent. It holds the context the screens can't: why the product exists and what has been decided. Keep it short, and update it as the project learns.

## The problem

Customer feedback arrives in five places: email, chat, interviews, surveys, and support tickets. It is copied into a spreadsheet when someone has time, which is rarely. By the time the team reviews it, the sharpest feedback is weeks old, and nobody can say how often a problem has come up.

## Who it's for

- **Maya, a product designer.** Reads feedback to decide what to explore next. Wants to see patterns, not a pile.
- **Luis, a support lead.** Captures feedback all day and needs it to take seconds, not minutes.
- **Priya, a product manager.** Triages weekly and needs to know what's new, what's urgent, and what has already been planned.

## What we're making

A small tool for collecting feedback. You land on an overview with the key numbers, and each number opens the feedback behind it. Anyone can add an item in a few seconds. Someone triages it by setting a status and a priority, adds notes on what they learned, and the overview shows where things stand.

## Decisions so far

- **One list, not a board.** We looked at a board in the early [breadboard](breadboard) and the [lofi feedback inbox](lofi/feedback-inbox); the list scales better once there are more than a dozen items.
- **Four statuses**: New, Triaged, Planned, Resolved. Anything finer can wait until the team asks for it.
- **Land on the overview, and drill down from it.** The key numbers (open issues, new, high priority, resolved) are at the top, and each is a link to the feedback behind it. The table itself has no numbers, so it stays about the work.
- **Notes live on the item.** A separate thread would split the story across two places.
- **No assignees yet.** The team is small enough to talk. Revisit if triage becomes a bottleneck.

## Open questions

- Should the status filter sit above the list or in a sidebar?
- Do customers need to hear back when their item is resolved?
- How long should resolved items stay in the feedback inbox?

## Where to look

The three screens are the [overview](app/overview), which is where you land, the [feedback inbox](app/feedback-inbox), and an item's [detail](app/detail). Every state of them has its own view in `states`. The [breadboard](breadboard) is the early flow sketch, the [handoff canvas](eng-handoff) is what engineering gets, and the [tour](start-here) explains how this prototype is put together.
