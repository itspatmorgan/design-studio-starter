# Onboarding

Onboarding welcomes designers and product managers after their studio opens. It is optional, enabled in the starter, and independent of the installer or coding tool.

## Behavior

The first local home-page visit opens `/onboarding`. The page introduces systems, prototypes, and the enabled artifact types in plain design language. It offers the available example systems and starter prototypes, explains customization, and supplies a request to copy into the coding agent. It links the Guide when enabled. Removed or archived samples are omitted; collection links provide a fallback. It does not create work, install dependencies, register contributors, or change configuration.

**Go to my studio** records completion and opens Home. Welcome stays available in the bottom rail and search. Visiting a sample does not mark the welcome complete. People can finish immediately without completing a checklist.

Completion is a local browser preference scoped by origin, base path, and onboarding version. It is not a repository or contributor setting. Changing browsers or clearing browser data shows Welcome again. Different studios served at the same origin and base path share this preference; a future studio identity can refine that scope. If storage is unavailable, the page still works, but completion lasts only until the page is reloaded.

The module uses the application's `localOnly` extension, so published viewing sites have no welcome route, rail entry, or redirect. Disabling or removing the module removes these contributions and retains the browser preference. It has no runtime dependency on optional Documentation; it links the Guide only when present in the manifest.

## Ownership

- `module.ts` declares the optional capability and its section.
- `app.tsx` adds the first-visit home contribution, local route, rail item, and search entry.
- `Welcome.tsx` owns the experience and copy.
- `progress.ts` handles the browser preference without repository writes.
- [Use onboarding](skills/use-onboarding/SKILL.md) guides an agent helping a person take their first steps.

Keep installation in the setup entry points and configuration in the platform Configure Studio skill. Onboarding complements both with an introduction after launch. This is a first scaffold to refine through designer feedback, not a complete guided tour or task-completion tracker.
