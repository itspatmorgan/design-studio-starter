# Prototype contract

This reference owns prototype files, metadata, links, dependency boundaries, and deployment status. Agent operating behavior belongs in the [build-prototype skill](skills/build-prototype/SKILL.md).

## Artifacts and files

An artifact is a navigable piece of prototype work backed by a file: a view, document, diagram, or canvas. Its owning file-type module determines how it opens and previews. This names the existing openable-file model; it adds no registration or separate storage.


A prototype lives at `src/prototypes/<contributor>/<id>/` and requires `meta.json`.

Views are `.tsx` or `.jsx` files with a default-exported React component. New views use `.tsx`. Plain `.jsx` is not type-checked.

Folders organize files at any depth. A file or folder starting with `_` is a helper. Helper contents do not become navigation artifacts.

Enabled file types determine other artifacts. Documents and canvases require their respective modules. Assets remain ordinary files. Follow the [static asset convention](../../platform/context/technical/assets.md) for their ownership, locations, and imports.

Two artifacts cannot share a URL, such as `main.tsx` and `main.md` in one folder.

## Metadata

| Field | Contract |
| --- | --- |
| `title` | Required display title. |
| `created` | Optional `YYYY-MM-DD` date. Creation fills it in. |
| `system` | Installed prototype system ID, or `null` for no system (custom styling). Omission uses the explicitly configured `defaultSystem`. Creation saves the chosen value. |
| `rebuild` | Optional pending migration: `targetSystem` is an installed ID or `null`; `source` is `src/prototypes/<contributor>/<id>`. Current `system` remains the runtime boundary until migration. |
| `order` | Relative file and folder paths placed first within their folder, in sequence. |
| `status` | `active` or `archived`. Omission means active. |

Remaining artifacts sort alphabetically, files before folders. Use `order` to reorder, rather than renaming files.

Moving, renaming, or deleting an artifact must update its `order` entries. The app performs these updates for its own operations.

Invalid metadata skips the prototype with a local warning and fails the production build.

With `system: null`, views start from browser colors and a system font, without registered system tokens or components. Use local components, CSS Modules, shared utilities, and installed packages. System imports remain outside this prototype's runtime boundary. Layout utilities without system tokens remain available; style colors, typography, and spacing in local CSS. This is distinct from an invalid system ID, which fails validation.

`pnpm new "Prototype Name"` assigns the studio default. Use `--system <id>` to choose another installed prototype system, or `--no-system` for custom styling.

The first available artifact in navigation order opens by default, including artifacts inside folders. Helpers and disabled file types are excluded. An empty prototype shows an empty state.

Contributor details come from `contributors.json` and `contributors/<key>.json`.

Gallery cards use the contributor's registered `github` username to load a profile photo. Initials appear while it loads, when no GitHub account is registered, or if the image is unavailable. Photo loading is optional and requires no GitHub authentication.

## Links and renaming

`/prototypes/<contributor>/<id>` opens the first available artifact in navigation order. Appending an artifact path without extension opens that artifact.

Nested folders become URL segments. Legacy addresses without `/prototypes` redirect to the canonical address.

Changing the title in the app also renames the prototype folder to its slug. Direct title changes should do the same unless requested otherwise.

Renaming changes shared URLs. Relative document links survive a prototype-folder rename.

The app rewrites links to the prototype's own address in its Markdown and canvas files. Direct file changes must update those links explicitly.

Use TanStack Router's `Link` for view navigation. See its [navigation documentation](https://tanstack.com/router/latest/docs/framework/react/guide/navigation).

## Duplication and system rebuilds

The local **Duplicate** action is available for your own personal prototypes. It copies files into a new folder, resets the creation date, makes an archived source's copy active, and rewrites self-address links in Markdown and canvas files. Relative imports and links stay local to the copy. Symbolic links are rejected; Git metadata, node_modules, and trash folders are excluded.

A different selected system records `rebuild.targetSystem` and the original repository path. It retains the source's resolved `system` so its copied implementation can still run. The confirmation explains that reconstruction is required. The sidebar supplies a copyable agent prompt; there is no automatic agent dispatch.

To finish, migrate code and the `system` value together, verify the build and rendered artifacts, then remove `rebuild`. Pending targets prevent removing that system through the studio CLI. Assignment has no in-place switching action in the app; direct code owners can still change metadata while migrating their implementation.

## Lofi mode

An opening `/** @lofi */` comment draws that view in grayscale with handwritten type. Its components and behavior remain unchanged.

Remove the comment for normal appearance. A folder named `lofi` has no special behavior. Local wireframes can also use custom components without this mode.

## Dependency boundaries

Prototype runtime code may depend on its own files, its assigned system's runtime components and assets, independent shared utilities, installed packages, and enabled public module libraries. System documentation adapters are outside runtime code.

Public module libraries are accessed through `@module/<id>` only. Private platform implementation, another prototype, and another system are outside this boundary. An enabled module must declare a public library before it can be reused this way.

These requirements apply to indirect and type-only dependencies. Dynamic imports use literal paths so checks can resolve them. Shared utilities cannot depend on prototypes, systems, or platform code.

Prototype styles use Tailwind classes or CSS Modules with local selectors. Plain CSS imports, `:global`, and CSS `@import` are not supported in prototype code. Assigned system tokens follow the [system styling contract](../systems/README.md#theme).

## Archiving and deployment

Archiving applies to a whole prototype. `meta.json.status: "archived"` keeps it available locally and excludes it and its files from production discovery and bundling. Omission or `active` restores publication eligibility. Unknown values fail validation.

Individual artifacts and folders have no separate archival status. Organizing them into a folder does not exclude them from publication. The build warns when active content links to an excluded prototype; a published viewer cannot open that target.

`src/platform/core/archive.ts` defines exclusion, and the manifest and production globs apply it. The [archiving rule](skills/organize-prototype/SKILL.md) owns the agent's choice and verification workflow.

## Validation

Module checks enforce runtime dependency boundaries through `scripts/lib/scope.js` and validate prototype styles. Manifest checks validate metadata and artifact structure. These checks do not enforce every agent operating instruction.

The [build-prototype skill](skills/build-prototype/SKILL.md) requires verification before committing. The [Asset Guard](../../platform/context/technical/assets.md#asset-guard) owns the staged-file size limit.

## Gallery system filter

`/prototypes?system=<id>` filters the gallery by the resolved system assignment. The active filter is visible and can be cleared. Title and contributor search (`q`) combines with the system filter and preserves it when typing or clearing search. Archived prototypes remain in their separate gallery section; the system overview counts and previews only active prototypes.

## Implementation files

The Prototypes module: the gallery at `/prototypes`, and the viewer every prototype, module artifact and system context section opens in. Required. The prototypes themselves are in `src/prototypes/<person>/<id>/`, which are your content.

- `module.ts`, `app.tsx`: who it is, its rail button, the `/prototypes` route, its front-page block, and its palette entries. A prototype opens through the platform's artifact routes (`src/platform/app/router.tsx`).
- `gallery/`: the gallery, a prototype's card, and the New prototype dialog (browser).
- `viewer/`: a prototype's layout, navigation and file tree, its menus and dialogs (browser). Source editing uses the [shared platform editor](../../platform/context/technical/source.md).
- `src/platform/app/source/ArtifactSource.tsx`: adapts prototype and system context access to the shared editor.
- `node/create.js`: `pnpm new`, and what the New prototype button runs (Node).

Agent contract: `src/modules/prototypes/skills/build-prototype/SKILL.md`.
