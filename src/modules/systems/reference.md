# System contract

Systems are discovered from their folders and explicitly registered in `studio.config.ts.systems`. Unregistered folders fail configuration validation. Each prototype uses one system. Runtime requirements are maintained in the [systems rule](../../systems/studio/rules/systems.md).

## Structure

A prototype system lives in `src/systems/<id>/` and contains:

| Path | Purpose |
| --- | --- |
| `system.ts` | Label, unique theme class, documentation mode, component sources, and origin. |
| `components/` | Runtime components and their documentation files. |
| `AGENTS.md` | Routes agent work to this system’s knowledge. |
| `context/`, `rules/`, `skills/` | System-owned knowledge and agent instructions. |
| `assets/` | Optional system-owned fonts, logos, and images. |
| `styles/theme.css` | Scoped tokens and styles, loaded by the platform. |
| `intro.tsx` | Optional Systems overview page. |

`system.ts`, introductions, examples, and Markdown are documentation adapters. Runtime components and prototypes cannot import these adapters.

The Overview uses a shared Studio presentation for purpose, authored summaries, live counts, and usage links. Guidance groups Context, Rules, and Skills; Code groups Theme and Components. `intro.tsx` can export a short `summary` describing the system’s purpose and audience; an optional `overview` object supplies system-specific `guidance` and `code` summaries. Its existing `intro` content appears in the collapsed Working with this system section. Systems without a summary receive a generic description. Counts come from discovered files, with each skill counted once through its required `SKILL.md`. Theme counts unique token names. The overview does not repeat the navigation’s file lists. Usage lists active prototypes assigned to that system; Studio instead explains its application role. General explanations and the system relationship diagram live in the Systems Guide rather than each overview.

The Studio system lives in `src/systems/studio/` with the same structure as other systems. Its `system.ts` declares `role: 'platform'`; other systems explicitly declare `role: 'prototype'`. Exactly one installed system must declare that role. Discovery resolves the application system by role, independently of its folder name. It must be registered and cannot be removed or assigned to prototypes. Its documentation mode is `off`. Every system explicitly declares `role`, `styling`, `colorModes`, `docs`, and `origin`. Platform infrastructure remains under `src/platform/`.

Follow the [static asset convention](../../platform/core/assets.md) for system assets and font loading.

The starter Product system uses shadcn/ui on Base UI. `components.json` controls the CLI destination. A replacement system may use another library.

`colorModes` declares supported modes: `['light']`, `['dark']`, or `['light', 'dark']`. This field is required; omission fails validation. Declare a single mode explicitly to protect a system that supports only that mode. Empty, duplicate, and unknown modes fail validation.

Studio follows the global mode. Rendered views, their document/canvas embeds, and Systems foundation previews and component examples resolve that mode against their system's capabilities. Unsupported global modes use the first supported mode. Documents, diagrams, canvas chrome, and source editors keep Studio's mode.

The shared `ThemeScope` sets `data-color-mode` and CSS `color-scheme` on the system boundary. Pop-ups stay inside it. Dark tokens use `.<theme-class>[data-color-mode="dark"]`; never use an ancestor `.dark` selector for system styles. Tailwind `dark:` utilities respect a local light boundary. Tailwind systems explicitly declare their runtime foundations on the system boundary. Foundation and component pages use the selected system's mode, including their background, headings, token tables, and component examples. The shared Overview, navigation, system knowledge, and source editors remain in Studio's scope; the Overview's Working with this system content retains the selected system's theme. The Overview and introduction call out supported modes using ColorModeSupport, which reads the declaration from system.ts.

The starter Product system and new system scaffolds declare both modes and include light and dark tokens. For a light-only system such as Sublime, declare `colorModes: ['light']`; for a dark-only system, declare `colorModes: ['dark']`. Its rendered content then keeps that mode regardless of Studio's toggle.

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

The [document-component skill](../../systems/studio/skills/document-component/SKILL.md) owns the scaffolding and documentation procedure.

## Foundations

Foundation pages come from custom properties in the theme. No separate foundation-page files are required. Preview geometry belongs to the documentation renderer, so omitted system utilities cannot collapse swatches or samples. Samples use the selected system’s live token values. Spacing and container widths appear separately.

| Token family | Page |
| --- | --- |
| `--radius*` | Radius |
| `--shadow*` | Shadows |
| `--spacing*`, `--space*` | Spacing |
| `--font*`, `--text*`, `--leading*`, `--tracking*` | Typography |
| Color values | Colors |
| Remaining tokens | Other tokens |

A system's theme is its declared inventory. Declare only the foundations it provides, including values matching upstream defaults. Omission intentionally excludes a token or an entire family. Studio and Product follow the same contract: neither receives the rest of Tailwind's catalog. Foundation pages show declarations from the theme entry point, including mode overrides; generated resets and utility mappings are not documentation tokens.

Declare `styling: 'tailwind'` or `styling: 'custom'` in `system.ts`. Tailwind declarations live directly on the unconditional system boundary in `styles/theme.css`; dark mode overrides those base values. Missing referenced tokens, inherited foundations, and dark-only declarations fail validation. There is no full-catalog completeness requirement. Adding a token is an intentional system change, alongside any component or example that needs it.

The CSS build resets Tailwind's built-in theme and generates utility mappings from registered system inventories. Theme-backed utilities are available only within systems declaring their dependencies. CSS `@scope` boundaries stop selectors at other systems, including nested embeds; generated boundary resets separately stop inherited custom properties. Utilities apply to the theme boundary itself and its descendants. This uses modern browser support for [`@scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope) (Baseline March 2026). Layout utilities such as `flex` and `overflow-hidden` remain available. Arbitrary CSS values remain authoring tools, not automatically documented system tokens. The named `rounded-full` choice also requires an explicit `--radius-full` declaration, even though Tailwind normally implements it as a built-in constant. Product declares square corners and a full radius for circular avatars and rounded bars.

`pnpm check` validates recognized theme-backed literal utility use in system components, examples, platform code, and assigned prototype code. A diagnostic names the file, utility, and missing token. Dynamic class construction cannot always be resolved statically; the CSS boundary still enforces availability. Custom component-local variables are not treated as missing system tokens.

Spacing is a finite inventory of `--spacing-4`, `--spacing-6`, and other chosen steps. Decimal steps use underscores, such as `--spacing-1_5` for `p-1.5`. The supplied themes omit the unrestricted `--spacing` multiplier, so declaring a few steps does not enable every numeric size. Component spacing formulas reference the selected tokens directly.

Breakpoint and container declarations also belong to the inventory. Query thresholds compile into CSS and cannot change through inherited variables. Systems sharing a query name must currently declare the same threshold; use unique names or scoped CSS queries when thresholds differ. Omitted breakpoint variants are unavailable in that system. Container width utilities read local values. This shared compiler restriction is validated rather than silently resolved from another system.

`src/platform/app/styles.css` owns imports and global application styles. The CSS build reads system declarations to configure Tailwind and filters generated utilities by system. Component-animation packages supply utility mechanics; their default theme is cleared as well. Supplied themes explicitly choose enter/exit animations and helper values, with keyframes prefixed by the owning theme class. Upstream packages remain sources for future intentional additions.

Systems declaring `styling: 'custom'` are exempt from the Tailwind vocabulary contract. Their theme entry point can contain scoped CSS and validated local imports with their own token names. A library that requires a React theme provider must wrap its system's views and documentation examples using that library; Studio does not automatically install or infer providers. JavaScript-only tokens need custom system documentation until a dedicated adapter is implemented. Top-level Tailwind `@theme` blocks remain application configuration and are rejected in prototype-system styles because they affect all systems.

## Source editing

Systems uses the [shared platform source workflow](../../platform/core/source.md). Right-click a navigation item for file actions, or use **⌘' / Ctrl+'** to toggle source. **⌘S / Ctrl+S** saves; the toggle or **Done** returns to rendering with unsaved-change protection. Source editors remain in Studio's color mode.

Component pages open their Page, Examples, and Component file tabs. Overview and Icons open the system's introduction source (`intro.tsx`). A missing introduction opens `system.ts`. Generated foundation pages open the system's theme CSS. There is no separate editable file for each token-family page.

Only these system source files and discovered component files are accessible through the local Systems source endpoint. Menus provide edit, external editor, reveal, and copying actions without rename or delete.

## Navigation and organization

The selected system has one persistent navigation tree, ordered Overview, Context, Rules, Skills, Theme, and Components. Overview opens the system’s overview source. Context, Rules, Skills, Theme, and Components start expanded. Opening a page expands its owning branch and folders and preserves the other branches’ state while navigating the selected system. Branches and folders use disclosure chevrons without category icons; individual pages and artifacts use icons to distinguish their type.

The Contents toolbar provides search across all sections and an expand-all or collapse-all action for branches and nested folders. Search matches navigation names and file paths, temporarily revealing matching branches and folders. Clearing search restores their previous expansion state. Creation actions remain beside Context, Rules, and Skills so their destination is clear.

Theme contains token pages generated from the system’s theme file. Its navigation actions expose that source. Component items group their documentation, examples, and runtime source without presenting category metadata as filesystem folders.

Context and Rules show their file and folder trees. Skills shows one entry per skill, opening its required `<name>/SKILL.md`; it does not repeat the skill as a folder and a document. Its source editor provides a file picker for the entry file and supporting references, scripts, assets, or other files inside the skill folder. Text files use the shared editor; other assets can be opened externally. Switching files protects unsaved edits. Direct links to supporting documents remain available.

Local menus support creation, source editing, rename, move, and recoverable deletion within each section’s rules. A skill entry’s Rename and Delete actions operate on its whole folder, preserving the required entry-file name and the skill’s supporting files. Its New actions create supporting files or folders. Drag operations are scoped to their owning tree: they cannot move a file into another system or another content section. Component and foundation menus retain source inspection actions; structural changes to their code require updating imports and related documentation through the agent or editor.

## System choice

The Systems navigation uses a grouped selector: Prototype systems contains installed prototype systems, with the configured default first; Studio contains Studio’s own system. Entering /systems opens the default prototype system; switching systems opens its overview. Explicit system URLs keep their selected system.

`meta.json.system` selects a prototype's system. Otherwise, it uses the studio default.

The configuration command preserves existing prototypes' system choices before changing the default. Migration must update imports and metadata together.

See `scripts/lib/studio-setup.js` for preservation and the setup-design-system skill for migration and placeholder cleanup.

Studio is maintained with Studio and excluded from prototype choices, default-system configuration, and system removal. Its runtime UI stays unavailable to prototypes and other systems.

## System knowledge and agent routing

A system’s guidance applies to its domain, not just its components. Studio rules cover Studio modules, architecture, documentation, and collaboration; product rules can cover terminology, accessibility, business requirements, and workflows.

A system owns five parts: foundations, components, context, rules, and skills. The latter three live directly in `src/systems/<id>/context/`, `rules/`, and `skills/`; the built-in Studio system uses `src/systems/studio/` with the same folders. No separate Handbook module or global content collection is required.

Systems exposes these files at `/systems/<id>/context/<file>`, `rules/<file>`, and `skills/<skill>/SKILL`. The shared source editor and file operations use explicit system and section identifiers. Content remains platform-styled even for a single-mode product system.

The repository's `AGENTS.md` supplies platform operating instructions and routes prototype work to its assigned system's `AGENTS.md`. System-local instructions link to relevant context, rules, and skills. System knowledge supplements platform constraints; it does not override runtime dependency boundaries. Different systems may use the same skill folder name because their source paths remain distinct. Discovery does not imply a harness automatically loads these files.

Module packs declare supplied platform files with `instructions: [{ path, when }]` and provide them under `instructions/` in the pack. Installation places them in the matching `src/systems/studio/` content folder. System packs carry their context, rules, skills, and `AGENTS.md` alongside their components. Removal must account for incoming references to system content.
