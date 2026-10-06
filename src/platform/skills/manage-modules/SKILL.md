---
name: manage-modules
description: "Create, install, enable, disable, or remove Design Studio modules and systems through the Studio CLI."
---

# Manage Modules

Read the [module contract](../../context/modules.md) before creating, installing, disabling, or removing modules or systems.

- Declare every installed module's enabled state and every installed system in `studio.config.ts`. Discovery does not grant activation. Modules declare `optional` and `lib`; systems declare role, styling contract, modes, docs policy, and origin.
- Run commands for the person. Use CLI help and previews for current arguments and proposed file changes.
- Preview `add`, `remove`, and `create-*` before applying them with `--yes`.
- Apply already-authorized choices without asking again. Ask for unresolved source, scope, or destructive choices.
- Treat installed modules as trusted code, not sandboxed data. Review the source and proposed dependencies before installation.
- Do not manually edit `studio.lock.json`, the generated module routing in `AGENTS.md`, or config module flags. Use studio commands.
- Do not bypass required-module constraints or unresolved dependencies with `--force`.
- If the license check rejects a source, obtain the person's decision before using `--allow-license`.
- Restart the dev server after CLI configuration, module installation, or system installation changes. Saving in local Studio settings restarts it automatically. Ordinary component edits update during development.
- Use the configuration command to change the default system. Preserve existing prototypes until intentional migration.
- Keep module imports within the public API and explicit framework entrypoints. Do not bypass private-platform checks.
- Apply the [contributor scope](../../context/contributor-scope.md) to shared changes.

Use `pnpm studio list` to inspect installed modules and `pnpm check` to validate their contracts.

The command synchronizes module-owned agent routing. Disabled module instructions must not direct work on unavailable features.
