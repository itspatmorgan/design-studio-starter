# Onboarding

Onboarding welcomes designers and product managers after their studio opens. It is optional, enabled in the starter, and independent of the installer or coding tool.

## Behavior

The first local home-page visit opens a four-step dialog over Home: Welcome, Prototypes, Systems, and Start by exploring. The system and artifact steps let people select a concept to see a short explanation and example. Only enabled artifact types appear. The final step focuses on exploring available starter prototypes, then explains two paths with the agent: make a prototype with an existing system, or set up a system of your own. Removed or archived samples are omitted.

**Explore my studio**, **Skip introduction**, Escape, backdrop dismissal, and opening a sample all record completion and close the introduction. It has no rail item, search entry, standalone page, or route. Later visits go directly to the studio. The Guide retains the concepts for later reading.

It does not create work, install dependencies, or register contributors. Its only configuration change records whether the introduction has already been shown.

Before the first automatic display, the local server sets `welcomeDismissed: true` in `studio.config.ts`, preserving other settings and comments. Welcome opens automatically only once for that studio, even if the person leaves before finishing or skipping. Restarts, different preview ports, browser changes, and introduction revisions do not reset it. When Onboarding is enabled, declare `welcomeDismissed` explicitly. Fresh installs start with `welcomeDismissed: false`; the first display toggles it to `true`. Older configurations without the flag are migrated on first display. This is studio-wide configuration, so committing the flag carries the dismissed state to other checkouts. An old empty `.design-studio-welcome-dismissed` marker is migrated into the flag and removed; no new marker is created. If persistence is unavailable, browser completion remains a fallback; changing origins can then show Welcome again.

The module uses the application's `localOnly` extension, so published viewing sites have no onboarding dialog. Disabling or removing the module removes these contributions and retains the config flag and browser fallback. It has no runtime dependency on optional Documentation.

## Ownership

- `module.ts` declares the optional capability.
- `app.tsx` adds the local first-visit home contribution without navigation.
- `Welcome.tsx` owns the dialog, steps, dismissal, and text.
- `ConceptPreview.tsx` owns the interactive system and artifact explanations.
- `Illustrations.tsx` adapts lightweight line drawings from the creator’s marketing site to Studio theme colors and human-readable labels.
- `progress.ts` handles the initial display request and browser fallback.
- `server.ts` exposes the same-origin local display claim; `node/progress.js` records the config flag atomically and migrates the previous empty marker.
- [Use onboarding](skills/use-onboarding/SKILL.md) guides an agent helping a person take their first steps.

Keep installation in the setup entry points and configuration in the platform Configure Studio skill. Onboarding complements both with an introduction after launch. This is a first scaffold to refine through designer feedback, not a complete guided tour or task-completion tracker.

## Design references

[Linear’s introduction](https://linear.app/learn/intro-to-linear) explains core concepts before deeper workflows. [NN/g’s onboarding guidance](https://www.nngroup.com/articles/onboarding-tutorials/) recommends easy dismissal and progressive disclosure, and cautions against lengthy tours that interrupt work. This introduction adapts those principles into a brief, skippable first-use dialog; it does not claim to reproduce Linear’s current UI.

The narrative follows the platform personas: start with what they can make and how they direct the agent, explain the pieces of a prototype, then show how a shared system makes the work fit their product. End with an example to explore and plain guidance for making a first prototype or setting up a system. Customization is an invitation, not a prerequisite. Marketing illustration references are `StudioOwnership.astro` and `StudioFoundation.astro` in the sibling `itspatmorgan.github.io` repository; local adaptations belong to this module and do not import from that repository.
