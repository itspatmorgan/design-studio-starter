# System contract

Systems are discovered from their folders and explicitly registered in `studio.config.ts.systems`. Unregistered folders fail configuration validation. Each prototype uses one system. Authoring guidance is maintained in the [system authoring context](context/authoring.md).

## Structure

A prototype system lives in `src/systems/<id>/` and contains:

| Path | Purpose |
| --- | --- |
| `system.ts` | Label, unique theme class, documentation mode, component sources, and origin. |
| `components/` | Runtime components and their documentation files. |
| `README.md` | Entry point for this system’s context, skills, and toolkit. |
| `AGENTS.md` | Routes agent work to this system’s knowledge. |
| `context/`, `skills/` | System-owned knowledge and agent instructions. |
| `assets/` | Optional system-owned fonts, logos, and images. |
| `styles/theme.css` | Scoped tokens and styles, loaded by the platform. |
| `intro.tsx` | Optional Systems overview page. |

`system.ts`, introductions, examples, and Markdown are documentation adapters. Runtime components and prototypes cannot import these adapters.

The Overview uses a shared Studio presentation for purpose, authored summaries, live counts, and usage links. The Instructions section groups Context and Skills; Toolkit groups Theme, Components, and local Assets. `intro.tsx` can export a short `summary` describing the system’s purpose and audience; an optional `overview` object supplies system-specific `guidance` and `code` summaries. `overview.starter: true` displays a replacement notice near the top; the bundled Product and Marketing systems opt in, while new system scaffolds do not. Instructions, Toolkit, and usage use separate full-width background modules stacked in that order, without section dividers. Each follows the same reading order: heading, metrics aligned to three columns, then authored description or bounded recent prototype list. Optional `intro` content appears directly below the overview, without a disclosure. Systems without a summary receive a generic description. Each section leads with prominent metrics above its authored description. Counts come from discovered files, with each skill counted once through its required `SKILL.md`. Theme counts unique token names. The overview does not repeat the navigation’s file lists. Usage counts all active prototypes assigned to that system, previews at most three newest prototypes, and links to `/prototypes?system=<id>` for the complete collection. Archived prototypes are excluded from the count and preview; Studio instead explains its application role. General explanations and the system relationship diagram live in the Systems Guide rather than each overview.

The Studio system lives in `src/systems/studio/` with the same structure as other systems. Its `system.ts` declares `role: 'platform'`; other systems explicitly declare `role: 'prototype'`. Exactly one installed system must declare that role. Discovery resolves the application system by role, independently of its folder name. It must be registered and cannot be removed or assigned to prototypes. Its documentation mode is `off`. Every system explicitly declares `status` (`active` or `archived`), `role`, `styling`, `colorModes`, `docs`, and `origin`. Platform infrastructure remains under `src/platform/`.

Follow the [static asset convention](../../platform/context/assets.md) for system assets and font loading.

The starter Product system uses shadcn/ui on Base UI. `components.json` controls the CLI destination. A replacement system may use another library.

`colorModes` declares supported modes: `['light']`, `['dark']`, or `['light', 'dark']`. This field is required; omission fails validation. Declare a single mode explicitly to protect a system that supports only that mode. Empty, duplicate, and unknown modes fail validation.

Studio follows the global mode. Rendered views, their document/canvas embeds, and Systems theme previews and component examples resolve that mode against their system's capabilities. Unsupported global modes use the first supported mode. Documents, diagrams, canvas chrome, and source editors keep Studio's mode.

The shared `ThemeScope` sets `data-color-mode` and CSS `color-scheme` on the system boundary. Pop-ups stay inside it. Dark tokens use `.<theme-class>[data-color-mode="dark"]`; never use an ancestor `.dark` selector for system styles. Tailwind `dark:` utilities respect a local light boundary. Tailwind systems explicitly declare their theme tokens on the system boundary. Theme and component pages use the selected system's mode, including their background, headings, token tables, and component examples. The shared Overview, navigation, system knowledge, and source editors remain in Studio's scope; optional additional overview content retains the selected system's theme. The Overview’s Toolkit section calls out supported modes using ColorModeSupport, which reads the declaration from system.ts.

The starter Product system and new system scaffolds declare both modes and include light and dark tokens. For a light-only system such as Sublime, declare `colorModes: ['light']`; for a dark-only system, declare `colorModes: ['dark']`. Its rendered content then keeps that mode regardless of Studio's toggle.

## Runtime boundaries

System runtime code may depend on its own runtime files, independent shared utilities, installed packages, and enabled public module libraries through `@module/<id>`. Other systems, prototype files, private platform implementation, and documentation adapters are outside its runtime boundary. Indirect and type-only dependencies follow the same requirements. Dynamic imports use literal paths.

Theme selectors and imported stylesheets stay under the system's unique theme class or its descendants. Keyframe names use the theme class followed by a dash. Font-face registration is permitted and follows the [static asset convention](../../platform/context/assets.md#scope-and-fonts).

Pop-ups render within the themed container. Starter Base UI portals pass `usePortalContainer()` as their `container`. This preserves system styling and local color-mode behavior.

## Page loading

The Systems layout remains mounted across its child routes. Component route loaders resolve documentation, examples, example source, and props together before displaying the next page. Intent preloading starts this work when navigating links. Successful sections remain available when another file fails; the page reports failures and offers retry. Source mode skips component loading so broken files remain repairable. Live documentation changes invalidate route data. Scroll resets before paint when changing pages.

## Component pages

A component can use a folder named for it:

```text
button/
  button.tsx
  index.ts
  button.md
  button.examples.tsx
```

`index.ts` re-exports the component. Flat component files are also discovered.

The Markdown page has a `title`, `description`, and `## When to use` section. Other sections are optional.

Each capitalized export from the examples file is one live example. The platform frames examples with the system's theme.

Props tables come from TypeScript. They summarize inputs rather than replacing upstream API documentation.

`origin: 'shadcn'` adds upstream component links. A Markdown page can provide its own `docs` URL. Declare `origin: null` when replacing the starter kit with another library.

Missing pages, examples, or required page fields normally produce warnings. `docs: 'strict'` makes these errors. `docs: 'off'` suppresses documentation warnings.

The [document-component skill](skills/document-component/SKILL.md) owns the scaffolding and documentation procedure.

## Theme

Theme pages come from custom properties in the theme. No separate theme-page files are required. Preview geometry belongs to the documentation renderer, so omitted system utilities cannot collapse swatches or samples. Samples use the selected system’s live token values. Spacing and container widths appear separately.

| Token family | Page |
| --- | --- |
| `--radius*` | Radius |
| `--shadow*` | Shadows |
| `--spacing*`, `--space*` | Spacing |
| `--font*`, `--text*`, `--leading*`, `--tracking*` | Typography |
| Color values | Colors |
| Remaining tokens | Other tokens |

A system's theme is its declared inventory. Declare only the theme tokens it provides, including values matching upstream defaults. Omission intentionally excludes a token or an entire family. Studio and Product follow the same contract: neither receives the rest of Tailwind's catalog. Theme pages show declarations from the theme entry point, including mode overrides; generated resets and utility mappings are not documentation tokens.

Declare `styling: 'tailwind'` or `styling: 'custom'` in `system.ts`. Tailwind declarations live directly on the unconditional system boundary in `styles/theme.css`; dark mode overrides those base values. Missing referenced tokens, inherited theme tokens, and dark-only declarations fail validation. There is no full-catalog completeness requirement. Adding a token is an intentional system change, alongside any component or example that needs it.

The CSS build resets Tailwind's built-in theme and generates utility mappings from registered system inventories. Theme-backed utilities are available only within systems declaring their dependencies. CSS `@scope` boundaries stop selectors at other systems, including nested embeds; generated boundary resets separately stop inherited custom properties. Utilities apply to the theme boundary itself and its descendants. This uses modern browser support for [`@scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope) (Baseline March 2026). Layout utilities such as `flex` and `overflow-hidden` remain available. Arbitrary CSS values remain authoring tools, not automatically documented system tokens. The named `rounded-full` choice also requires an explicit `--radius-full` declaration, even though Tailwind normally implements it as a built-in constant. Product declares square corners and a full radius for circular avatars and rounded bars.

`pnpm check` validates recognized theme-backed literal utility use in system components, examples, platform code, and assigned prototype code. A diagnostic names the file, utility, and missing token. Dynamic class construction cannot always be resolved statically; the CSS boundary still enforces availability. Custom component-local variables are not treated as missing system tokens.

Spacing is a finite inventory of `--spacing-4`, `--spacing-6`, and other chosen steps. Decimal steps use underscores, such as `--spacing-1_5` for `p-1.5`. The supplied themes omit the unrestricted `--spacing` multiplier, so declaring a few steps does not enable every numeric size. Component spacing formulas reference the selected tokens directly.

Breakpoint and container declarations also belong to the inventory. Query thresholds compile into CSS and cannot change through inherited variables. Systems sharing a query name must currently declare the same threshold; use unique names or scoped CSS queries when thresholds differ. Omitted breakpoint variants are unavailable in that system. Container width utilities read local values. This shared compiler restriction is validated rather than silently resolved from another system.

`src/platform/app/styles.css` owns imports and global application styles. The CSS build reads system declarations to configure Tailwind and filters generated utilities by system. Component-animation packages supply utility mechanics; their default theme is cleared as well. Supplied themes explicitly choose enter/exit animations and helper values, with keyframes prefixed by the owning theme class. Upstream packages remain sources for future intentional additions.

Systems declaring `styling: 'custom'` are exempt from the Tailwind vocabulary contract. Their theme entry point can contain scoped CSS and validated local imports with their own token names. A library that requires a React theme provider must wrap its system's views and documentation examples using that library; Studio does not automatically install or infer providers. JavaScript-only tokens need custom system documentation until a dedicated adapter is implemented. Top-level Tailwind `@theme` blocks remain application configuration and are rejected in prototype-system styles because they affect all systems.

## Assets browser

Assets lists local files in `assets/` for the selected registered system. Its navigation contains Fonts, Icons, and Images pages, even when empty. Icons combines local icons with the declared library’s existing examples. There is no combined Assets page. Pages with no local files and no configured icon library use Studio’s Empty component with guidance for adding material. Files under `icons/` appear as Icons; other image files appear as Images. Supported extensions are SVG, PNG, JPG, JPEG, WebP, AVIF, GIF, ICO, WOFF, WOFF2, TTF, and OTF. The browser and Overview's local-asset count use the same inventory. Package files are not counted as local assets.

Type pages use `/systems/<id>/fonts`, `/systems/<id>/icons`, and `/systems/<id>/images`. Individual previews append the asset’s relative path to its type page. Previous asset preview links remain readable; the previous Assets index redirects to Fonts. Images render through image elements rather than inline SVG execution. Font previews load only the selected font under a unique temporary family and remove it on navigation. Previews use Studio's appearance and do not activate assets in a system theme. Unknown files show Not Found. Assets have no text-source editor or structural file actions; use the agent or repository editor to add and maintain them.

## Source editing

Systems uses the [shared platform source workflow](../../platform/context/source.md). Right-click a navigation item for file actions, or use **⌘' / Ctrl+'** to toggle source. **⌘S / Ctrl+S** saves; the toggle or **Done** returns to rendering with unsaved-change protection. Source editors remain in Studio's color mode.

Component pages open their Page, Examples, and Component file tabs. Overview and Icons open the system's overview source (`intro.tsx`). A missing overview source opens `system.ts`. Generated theme pages open the system's theme CSS. There is no separate editable file for each token-family page.

Only these system source files and discovered component files are accessible through the local Systems source endpoint. Menus provide edit, external editor, reveal, and copying actions without rename or delete.

## Navigation and organization

The selected system has one navigation tree, ordered Overview, Context, Skills, Theme, Assets, and Components. Overview opens the system’s overview source. Context, Skills, Theme, Assets, and Components start expanded. Context and Skills read this system’s original guidance files. Branches use disclosure chevrons; individual pages use icons to distinguish their type.

The Resources toolbar searches all system navigation and provides an expand-all or collapse-all action. Search matches navigation names and file paths, temporarily revealing matching branches. Clearing search restores their previous expansion state. Context and Skills provide creation actions in their own branches.

Theme contains token pages generated from the system’s theme file. Its navigation actions expose that source. Component items group their documentation, examples, and runtime source without presenting category metadata as filesystem folders.

In Systems, Context shows original file and folder trees. Skills shows one entry per skill, opening its required `<name>/SKILL.md`; it does not repeat the skill as a folder and a document. Its source editor provides a file picker for the entry file and supporting references, scripts, assets, or other files inside the skill folder. Text files use the shared editor; other assets can be opened externally. Switching files protects unsaved edits. Direct links to supporting documents remain available.

Local menus support creation, source editing, rename, move, and recoverable deletion within each section’s rules. A skill entry’s Rename and Delete actions operate on its whole folder, preserving the required entry-file name and the skill’s supporting files. Its New actions create supporting files or folders. Drag operations are scoped to their owning tree: they cannot move a file into another system or another content section. Component and theme menus retain source inspection actions; structural changes to their code require updating imports and related documentation through the agent or editor.

## System choice

Entering `/systems` opens a collection with search and the shared cards/list preference. Cards show names and purpose descriptions, with a Default badge beside the configured default prototype system’s name. Studio has a Platform badge in cards and list rows, with a tooltip explaining its required role and exclusion from prototype choices. Prototype systems show active prototype usage to indicate dependency; Studio has no prototype usage count. Component and asset inventories belong to each system’s Overview. The default prototype system appears first; Studio appears last, with its platform ownership explained in its description. Opening a system shows its named resource navigation, with no system selector or back link. The main Systems navigation returns to the collection. Explicit system URLs still open their selected system.

Locally, registered Admins can use **New system** to name and create a scaffold. The module’s `create` server route resolves the current actor and configuration, enforces Admin access, and delegates registration and validation to `studio create-system`. Creation preserves the default and existing content. CLI preview and application run asynchronously inside the system-operation marker, so manifest and HMR updates cannot expose a partial scaffold. The configuration watcher batches the completed changes into a server restart. A dev-only creation status surface is injected before the React entrypoint and persists in the initiating tab across that restart. Its typography uses a stable system font and explicit text styles, smoothing, and box sizing so loading application CSS and web fonts cannot change its appearance. The response changes the destination with history replacement instead of starting a competing document load; the new Overview releases the status surface only after its manifest entry is ready. Failure returns to the name dialog, and a delayed opening offers a reload without resubmitting creation. New system scaffolds declare an empty theme scope with no tokens, components, assets, context, or skills. A completely blank active prototype system shows two setup paths on its local Overview: targeted curation from open libraries or assessment of an existing React system. The introduction explains collaboration with the agent and review in Studio. Each prompt is visible and copyable, identifying the system by its display name and explicit ID. The blank Overview omits inventory and usage modules. Once content is added, it shows the normal Overview. Empty Theme navigation declares “No tokens yet” and does not invent a Typography page. Existing populated systems retain their chosen inventories. Published sites have no creation action or setup panel.

`meta.json.system` selects a prototype's system; explicit `null` selects no system. Only omission uses the studio default. The [prototype contract](../prototypes/README.md#metadata) owns the metadata definition.

## System lifecycle

The system name is shared by the index, navigation header, and Overview heading. Index cards and list rows share the header's actions menu, including for archived systems. Card and row triggers appear on hover or keyboard focus and remain visible on touch devices. Active systems offer Copy link and, for registered local contributors, Open in editor, Reveal in Finder, and Copy path. Actions follow the prototype menu grouping: access, changes, then Delete alone. The local `action` route rechecks registration and Admin roles. Admins can rename, archive, restore, delete, or set a default for prototype systems. Archived systems offer only Restore and Delete to Admins; other contributors see no actions menu. Restore before renaming or choosing a default. Studio remains protected. Published sites offer only Copy link for active systems.

Rename changes the label, folder ID, registration, default when applicable, prototype assignments, pending targets, imports, and local links together. The independently declared theme class stays unchanged. System declarations must be plain data objects, so discovery can refresh them without executing cached modules. A brief toast confirms reference updates; rename has no additional impact confirmation. Remaining path references are recorded in `renameReview` and shown in a persistent Overview notice with copyable cleanup instructions. Lifecycle CLI commands preview changes before `--yes`: `rename-system <id> --label <name>`, `archive-system <id>`, `restore-system <id> [--restore-prototypes]`, and `delete-system <id>`. Applied changes roll back if validation fails. Lock entries and project skill exposure stay synchronized.

Archive sets `system.ts.status` to `archived` and archives associated active prototypes. Their metadata records `archivedBySystem` so restoration can distinguish them from prototypes already archived. Archived systems remain registered and locally browsable, but leave creation choices and deployment. Both indexes show archived items in a separate **Archived** section below active items, using the same search, cards/list preference, and muted appearance. The section is absent when there are no matching archived items. The build excludes archived systems' declarations, introductions, examples, assets, knowledge, and theme CSS. Open an archived system and use its header menu to restore it, with an explicit choice to restore associated prototypes. Restore never changes the default. Choose another default before archive or deletion.

Local deletion keeps a persistent status surface across the configuration restart. It routes to the Systems index and fades out only when the deleted registration is absent from the refreshed collection and manifest. A failed request releases the transition and reports the error without resubmitting. Delete permanently removes the source and registration without retaining a Studio trash copy. The confirmation lists affected prototypes and warns about rebuilds and uncommitted files. Assigned prototypes retain their original code and deleted assignment, with explicit `systemMissing: { id, label }` metadata. They remain locally discoverable with rebuild instructions; view imports, typechecking, and deployment exclude that non-runnable source until migration is complete. Rebuild the implementation and assignment together, then remove `systemMissing`. Pending rebuild requests targeting the deleted system are cancelled. Recovery requires previously committed Git history.

The configuration command preserves existing prototypes' system choices before changing the default. Migration must update imports and metadata together.

See `scripts/lib/studio-setup.js` for preservation and the setup-design-system skill for migration and placeholder cleanup.

Studio is maintained with Studio and excluded from prototype choices, default-system configuration, and system removal. Its runtime UI stays unavailable to prototypes and other systems.

## System knowledge and agent routing

The [contracts and operating instructions foundation](../../platform/context/contracts-and-instructions.md) distinguishes technical contracts from operating policy, intent, and procedures.

A system’s guidance applies to its product and design domain. Platform and modules own their operating knowledge and procedures.

A system owns five parts: theme, components, assets, context, and skills. Assets include fonts, icons, logos, and shared imagery. They may be local files or explicit package dependencies; their ownership follows the static asset convention. Context and skills live directly in their system folders. The navigation exposes all five parts, including Assets when no local files exist.

Systems exposes these files at `/systems/<id>/context/<file>` and `/systems/<id>/skills/<skill>/SKILL`. Saved links from the combined Documentation browser redirect here. The shared source editor and file operations use explicit system and section identifiers. Content remains platform-styled even for a single-mode product system.

The repository's `AGENTS.md` supplies platform operating instructions and routes prototype work to its assigned system's `AGENTS.md`. System-local instructions link to relevant context and skills. System knowledge supplements platform constraints; it does not override runtime dependency boundaries. Different systems may use the same skill folder name because their source paths remain distinct. Discovery does not imply a harness automatically loads these files.

Module packs carry module-owned context and skills. Their declared instruction paths are relative to their module folder. System packs carry context, skills, and AGENTS.md alongside their components.

## Implementation files

The design systems pages, at `/systems`: what each system has, its tokens, and a page per component. Required. The systems themselves are
folders in `src/systems/<id>/`, which are your content.

- `module.ts`, `app.tsx`: who it is, its rail button and routes.
- `spec.ts`: what a `system.ts` declares (`SystemSpec`) and the check for it.
- `sources.ts`, `docs.ts`, `scaffold.ts`, `themeTokens.ts`: where a component came from, how its docs and props are read, the starter docs a new component gets, and the theme's tokens.
- `pages/`, `data/`: the Systems pages and the loaders behind them (browser).
- `node/`: finding systems, building their docs and props, and `pnpm component-docs` (Node).
