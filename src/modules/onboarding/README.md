# Onboarding

Onboarding welcomes designers and product managers after their studio opens. It is optional, enabled in the starter, and independent of the installer or coding tool.

## Behavior

Each contributor’s first local home-page visit opens a four-step dialog over Home: Welcome, Prototypes, Systems, and Start by exploring. The system and artifact steps let people select a concept to see a short explanation and example. Only enabled artifact types appear. The introduction labels Product and Marketing as example systems and Feedback Inbox and Design Studio Marketing as example prototypes for learning. It invites people to customize, replace, or remove these examples for their own needs. The final step focuses on exploring available starter prototypes, then explains two paths with the agent: make a prototype with an existing system, or set up a system of your own. Removed or archived samples are omitted.

**Explore my studio**, **Skip introduction**, Escape, backdrop dismissal, and opening a sample all record completion and close the introduction. It has no rail item, search entry, standalone page, or route. Later visits go directly to the studio. The Guide retains the concepts for later reading.

It does not create work, install dependencies, or register contributors. Its only profile change records whether that contributor has already seen the introduction.

Before the first automatic display for a registered contributor, the local server sets `welcomeDismissed: true` on their profile in `contributors/<key>.json` or their legacy `contributors.json` entry. It preserves other fields and contributor entries. An absent flag or `false` means the introduction has not been shown. New registration needs no progress flag. Only the server-resolved contributor can claim their introduction; the request cannot choose a contributor or file.

Welcome opens automatically once per contributor per studio, even if they leave before finishing or skipping. Restarts, different preview ports, browser changes, and introduction revisions do not reset it. Committing the profile carries that person's progress to other checkouts without dismissing Welcome for teammates. Set that contributor's flag to `false` to show it again after reloading.

Before registration, exploration uses browser completion without changing profiles. Browser fallback is also used if profile persistence is unavailable, and is keyed by contributor identity. It may repeat when browser origins change. The previous studio-level flag and empty marker are ignored and left untouched: neither identifies who saw Welcome. Existing contributors without profile progress receive the introduction once under the new behavior.

The module uses the application's `localOnly` extension, so published viewing sites have no onboarding dialog. Disabling or removing the module removes these contributions and retains contributor profile flags and browser fallback. It has no runtime dependency on optional Documentation.

## Ownership

- `module.ts` declares the optional capability.
- `app.tsx` adds the local first-visit home contribution without navigation.
- `Welcome.tsx` owns the dialog, steps, dismissal, and text.
- `ConceptPreview.tsx` owns the interactive system and artifact explanations.
- `Illustrations.tsx` adapts lightweight line drawings from the creator’s marketing site to Studio theme colors and human-readable labels.
- `progress.ts` handles the initial display request and browser fallback.
- `server.ts` exposes the same-origin local display claim; `node/progress.js` records the resolved contributor’s profile flag atomically.
- [Use onboarding](skills/use-onboarding/SKILL.md) guides an agent helping a person take their first steps.

Keep installation in the setup entry points and configuration in the platform Configure Studio skill. Onboarding complements both with an introduction after launch. This is a first scaffold to refine through designer feedback, not a complete guided tour or task-completion tracker.

## Design references

[Linear’s introduction](https://linear.app/learn/intro-to-linear) explains core concepts before deeper workflows. [NN/g’s onboarding guidance](https://www.nngroup.com/articles/onboarding-tutorials/) recommends easy dismissal and progressive disclosure, and cautions against lengthy tours that interrupt work. This introduction adapts those principles into a brief, skippable first-use dialog; it does not claim to reproduce Linear’s current UI.

The narrative follows the platform personas: start with what they can make and how they direct the agent, explain the pieces of a prototype, then show how a shared system makes the work fit their product. End with an example to explore and plain guidance for making a first prototype or setting up a system. Customization is an invitation, not a prerequisite. Marketing illustration references are `StudioOwnership.astro` and `StudioFoundation.astro` in the sibling `itspatmorgan.github.io` repository; local adaptations belong to this module and do not import from that repository.
