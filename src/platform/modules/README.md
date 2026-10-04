# Module contract

A module is a folder in `src/platform/modules/<id>/` with a `module.ts` declaration. The platform discovers declarations without a separate registry.

Modules are copied into the repository. They are not downloaded or loaded as plugins at runtime.

## Ownership and dependencies

Keep a feature's implementation inside its module. Optional modules must support disabling and removal.

Prototypes, Views, Text files, and Systems are required. Platform code and modules may depend on required modules.

A module cannot import another optional module's implementation. Outside code can read an optional module's declaration or its enabled public library entry.

Prototypes access public libraries through `@module/<id>`. They cannot import private platform paths. Runtime library code has its own dependency checks.

`src/platform/core/modules/index.ts` defines declarations and compatibility. `src/platform/core/api.ts` identifies shared extension types.

`requires` declares the minimum platform version. An incompatible module is disabled and reported by checks. The contract is currently 0.x and may change.

## Capability files

| Path | Purpose |
| --- | --- |
| `module.ts` | Identity, compatibility, optional status, section, dependencies, library, and agent instruction declarations. |
| `app.tsx` | Navigation, routes, overview blocks, palette entries, and prototype actions. |
| `type.ts`, `open.tsx`, `loader.ts` | File-type declaration, rendering, and production loading. |
| `server.ts` | Local routes at `POST /__studio/<module>/<route>`. |
| `check.ts` | Module validation while enabled. |
| `lib/index.ts(x)` | Public entry exposed when `lib: true`. |
| `instructions/` in a pack | Declared agent files installed into `src/systems/platform/`. |

Every module declares `optional` and `lib` as booleans. Omission cannot silently determine removability or expose a public library.

A section can declare a content folder, prototype-shaped items, contributor grouping, editing policy, and standalone published views.

Use the TypeScript declaration for exact fields. See the [file-type contract](../core/fileTypes.md) for file capabilities.

Design systems are content in `src/systems/`, not platform modules. Their [contract](systems/reference.md) defines system structure.

## Configuration and commands

`studio.config.ts` holds identity, personal or team use, enabled modules, and the default system. Each installed module has an explicit true/false entry, and each installed system appears in `systems`. Omitted declarations fail validation. Other customization happens in code.

```sh
pnpm studio list
pnpm studio disable <id>
pnpm studio enable <id>
pnpm studio add <source>
pnpm studio remove <module-or-system>
pnpm studio create-module <id>
pnpm studio create-system <id>
pnpm studio sync
pnpm check
```

Add, remove, and create commands preview changes. Applying them requires `--yes`. Use CLI help for source formats and optional flags.

Studio commands register and unregister capabilities, manage config module flags, `studio.lock.json`, and module-owned routing in `AGENTS.md`. The [module rule](../../systems/platform/rules/modules.md) governs agent execution.

Disabling retains files. Removal deletes the module and its declared platform instruction files. External content remains unless removal includes `--content`.

Packages remain installed after removal. Remove them only when no retained code uses them.

## Installation contract

Preview reads declarations as data. Applying installation trusts the module's code. It can execute the installed declaration and checks.

Packages install with lifecycle scripts disabled. Failed checks restore project files, but downloaded packages may remain in `node_modules`.

Sources can be local folders, HTTPS or SSH Git addresses, or HTTPS tarballs. HTTP, `file://`, and `git://` sources are rejected.

Packs cannot contain symlinks, escaping paths, or file collisions. Limits are 500 files, 2 MB per file, and 20 MB total.

Upstream libraries require their license and provenance. The license override is an explicit user decision, governed by the module rule.

Installation is not a sandbox. Installed code has the privileges of repository code.

## Discovery and verification

Node tooling discovers modules through `scripts/lib/modules.js`. Browser discovery uses `src/platform/app/data/modules.ts`.

The manifest scans declared content sections. Vite supplies file globs and themes. The shell combines module navigation and routes.

`pnpm check` validates declarations, configuration, section collisions, dependency boundaries, file-type contracts, and enabled module checks.

`pnpm baseline removal <id>` checks physical removal. Optional-module verification should also cover disabling and retained content.

A module's README owns its human Guide chapter and developer orientation. Rules state agent requirements. Skills sequence tasks. Link to contracts instead of copying them.
