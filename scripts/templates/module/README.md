# __LABEL__

A module for Design Studio. It adds a page at `/__ID__` and a button for it on the rail.

- `module.ts` says what it is and what it adds.
- `app.tsx` is the page and the rail button.
- `instructions/rules/__ID__.md` is what an agent should know before changing it. It is installed into `src/systems/platform/rules/`,
  and AGENTS.md routes agents to it while the module is on.

To use it in another Design Studio, publish this folder as a git repository and run `pnpm studio add <address>` there.
To check it before that, run `pnpm check`.
