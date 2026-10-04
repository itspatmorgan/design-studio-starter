# System contract

Systems are discovered from their folders. Each prototype uses one system. Runtime requirements are maintained in the [systems rule](../../rules/systems.md).

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
| `intro.tsx` | Optional Systems introduction page. |

`system.ts`, introductions, examples, and Markdown are documentation adapters. Runtime components and prototypes cannot import these adapters.

The platform system lives in `src/platform/components/` and `src/platform/styles/`. Its documentation mode is `off`.

Follow the [static asset convention](../../core/assets.md) for system assets and font loading.

The starter Product system uses shadcn/ui on Base UI. `components.json` controls the CLI destination. A replacement system may use another library.

`colorModes` declares supported modes: `['light']`, `['dark']`, or `['light', 'dark']`. Omission supports both modes and follows Studio. Declare a single mode explicitly to protect a system that supports only that mode. Empty, duplicate, and unknown modes fail validation.

Studio follows the global mode. Rendered views, their document/canvas embeds, and Systems foundation previews and component examples resolve that mode against their system's capabilities. Unsupported global modes use the first supported mode. Documents, diagrams, canvas chrome, and source editors keep Studio's mode.

The shared `ThemeScope` sets `data-color-mode` and CSS `color-scheme` on the system boundary. Pop-ups stay inside it. Dark tokens use `.<theme-class>[data-color-mode="dark"]`; never use an ancestor `.dark` selector for system styles. Tailwind `dark:` utilities respect a local light boundary. System tokens override scoped Studio fallback tokens. Systems UI pages use the selected system's mode, including its background, headings, token tables, and component examples. Studio navigation, system knowledge, and source editors remain in Studio's scope. The introduction calls out supported modes in its Theme section using ColorModeSupport, which reads the declaration from system.ts.

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

`origin: 'shadcn'` adds upstream component links. A Markdown page can provide its own `docs` URL. Remove an unsuitable origin when replacing the starter kit.

Missing pages, examples, or required page fields normally produce warnings. `docs: 'strict'` makes these errors. `docs: 'off'` suppresses documentation warnings.

The [document-component skill](../../skills/document-component/SKILL.md) owns the scaffolding and documentation procedure.

## Foundations

Foundation pages come from custom properties in the theme. No separate foundation-page files are required.

| Token family | Page |
| --- | --- |
| `--radius*` | Radius |
| `--shadow*` | Shadows |
| `--spacing*`, `--space*` | Spacing |
| `--font*`, `--text*`, `--leading*`, `--tracking*` | Typography |
| Color values | Colors |
| Remaining tokens | Other tokens |

Typography includes Tailwind defaults where tokens do not override them. Pages appear when relevant tokens exist, with typography always available.

## Source editing

Systems uses the [shared platform source workflow](../../core/source.md). Right-click a navigation item for file actions, or use **⌘' / Ctrl+'** to toggle source. **⌘S / Ctrl+S** saves; the toggle or **Done** returns to rendering with unsaved-change protection. Source editors remain in Studio's color mode.

Component pages open their Page, Examples, and Component file tabs. Introduction and Icons open the system's introduction source (`intro.tsx`, or the platform's `platformSystem.tsx`). A missing introduction opens `system.ts`. Generated foundation pages open the system's theme CSS. There is no separate editable file for each token-family page.

Only these system source files and discovered component files are accessible through the local Systems source endpoint. Menus provide edit, external editor, reveal, and copying actions without rename or delete.

## Navigation and organization

The selected system has one persistent navigation tree. Introduction opens the system’s introduction source. Foundations, Components, Context, Rules, and Skills are expandable branches. Opening a page expands its owning branch and preserves the other branches’ state.

Foundations identifies its theme source; token pages are generated views of that file. Component items group their documentation, examples, and runtime source without presenting category metadata as filesystem folders.

Context, Rules, and Skills reuse the prototype file tree. Local menus support creation, source editing, rename, move, and recoverable deletion within each section’s rules. Drag operations are scoped to their owning tree: they cannot move a file into another system or another content section. Component and foundation menus retain source inspection actions; structural changes to their code require updating imports and related documentation through the agent or editor.

## System choice

The Systems navigation uses a grouped selector: Prototype systems contains installed prototype systems, with the configured default first; Platform contains Studio’s own system. Entering /systems opens the default prototype system; switching systems opens its introduction. Explicit system URLs keep their selected system.

`meta.json.system` selects a prototype's system. Otherwise, it uses the studio default.

The configuration command preserves existing prototypes' system choices before changing the default. Migration must update imports and metadata together.

See `scripts/lib/studio-setup.js` for preservation and the setup-design-system skill for migration and placeholder cleanup.

## System knowledge and agent routing

A system owns five parts: foundations, components, context, rules, and skills. The latter three live directly in `src/systems/<id>/context/`, `rules/`, and `skills/`; the built-in Platform system uses the corresponding folders under `src/platform/`. No separate Handbook module or global content collection is required.

Systems exposes these files at `/systems/<id>/context/<file>`, `rules/<file>`, and `skills/<skill>/SKILL`. The shared source editor and file operations use explicit system and section identifiers. Content remains platform-styled even for a single-mode product system.

The repository's `AGENTS.md` supplies platform operating instructions and routes prototype work to its assigned system's `AGENTS.md`. System-local instructions link to relevant context, rules, and skills. System knowledge supplements platform constraints; it does not override runtime dependency boundaries. Different systems may use the same skill folder name because their source paths remain distinct. Discovery does not imply a harness automatically loads these files.

Module packs declare supplied platform files with `instructions: [{ path, when }]` and provide them under `instructions/` in the pack. Installation places them in the matching Platform content folder. System packs carry their context, rules, skills, and `AGENTS.md` alongside their components. Removal must account for incoming references to system content.
