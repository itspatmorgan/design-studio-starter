# Modules

Modules are the parts of Design Studio that can be turned off, added, or removed: the Guide and anything built by the team or the community. Design systems (`src/systems/<id>/`) are added the same way. The person doesn't run commands: you do, and tell them what happened in plain words. The reference is `src/platform/modules/README.md`.

## Commands

```sh
pnpm studio list
pnpm studio disable <module>       # turn an optional module off in studio.config.ts; enable turns it on
pnpm studio add <source>           # review only
pnpm studio add <source> --yes     # add it
pnpm studio remove <id>            # review only; --yes deletes; --content also deletes what it keeps
pnpm studio create-module <id>     # or create-system; --out <folder> makes a pack to publish
pnpm studio sync                   # AGENTS.md's module lines (the other commands run it)
pnpm check
```

## Rules

- **Review first, then ask.** `add`, `remove` and `create-*` show what they will do and change nothing without `--yes`. Run it without `--yes`, tell the person what the module is, where it comes from, what it adds and any packages it wants, and add it only when they say to. A module is code that runs in their app: never add one the person didn't ask for or didn't trust, and never run anything from a source yourself.
- **Never edit what the commands manage by hand:** `studio.lock.json`, the module lines in `AGENTS.md` (between the `studio:modules` markers), and the `modules` list in `studio.config.ts`. Use the commands.
- **Say when to restart.** After any change to modules or design systems, the dev server must be restarted to show it.
- **Some can't be turned off or removed**: the Handbook and Systems, because prototypes are built on them. Don't work around that.
- **A license matters.** If a module is built on an open source library and the command refuses its license, tell the person; `--allow-license` is their decision, not yours.
- **When a module is off or removed**, its rule leaves AGENTS.md. Don't follow a rule from a module that is off.
- **Adding a design system** records the current default in `studio.config.ts` first, so existing prototypes keep their system. Say which system is the default.
- **To change a module you added**, change its files: they're the team's copy. `pnpm check` notes which differ from the original, which is only information.
