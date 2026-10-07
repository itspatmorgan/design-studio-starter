---
title: "Editing and saving"
---

Source editing is a shared platform capability used by Prototypes, Systems, and Documentation. It has no separate module, route section, or navigation entry.

## File workflow

Right-click a file-backed navigation item to **Edit source** or **View source** when read-only. Its menu also exposes **Open in editor**, **Reveal in Finder**, **Copy link**, and **Copy path**. Module-specific actions such as renaming remain subject to that module's permissions.

**Open in editor** checks installed Cursor, Visual Studio Code, VSCodium, Zed, and Sublime Text applications or executables. A supported `LAUNCH_EDITOR` name takes priority. On macOS it opens the application directly, so its terminal command need not be installed. If none can open, it reveals the file and explains that **Edit source** is available inside Studio. Launch and reveal failures are visible. The same-origin server action accepts only existing, non-hidden source files or folders under `src/`, without symlinks or traversal.

Locally, **⌘' / Ctrl+'** toggles the selected page between rendering and source. The editor receives focus when opened; returning focuses the rendered content. **⌘S / Ctrl+S** saves. **Done** also returns to the rendered view. **⌘; / Ctrl+;** toggles navigation in either view.

Returning or navigating away with unsaved changes requires confirmation. External edits reload clean editors and offer a conflict choice when local changes are unsaved. Saving checks the version read from disk before writing.

Source editing is available during local development. Published pages retain their reading experience and copying actions without repository editing.

## Navigation handoff

Internal links use TanStack Router. Destination loaders prepare their content, layout, and page renderer before committing navigation. The current page stays visible during preparation. The persistent shell shows **Opening page** after a 200 ms wait. Intent preloading prepares likely destinations without showing progress. Loader failures use the route error surface with retry.

File readers share `prepareFile` from `app/data/fileTypeModule.ts`. It awaits the file loader and the page's optional `preload` together. Use TanStack `lazyRouteComponent` for deferred page renderers so successful preloading makes their first render synchronous. System guidance and the owner knowledge browser prepare documents in route loaders, rather than fetching after mount. Source routes prepare their editor code independently of rendered files so broken code remains repairable.

Document scroll resets before paint when its identity changes. Content edits preserve the current scroll position. Embedded previews remain mounted through unrelated manifest updates. Canvas previews reload for their own file identity or explicit file-change notifications.

Development manifest and file-loader notifications share a serialized refresh queue. Prepared pages remain cached until repository notifications invalidate them. Known file changes invalidate matching active and cached file readers. Manifest changes refresh the shared inventory and route data. Bursts merge into one refresh. Edits arriving during a refresh schedule one trailing refresh. All Markdown scopes self-accept compiled updates. Guide and reference readers use `createMarkdownLoader`, which retains updated modules and distinguishes reference rendering from ordinary document rendering. Managed operations that restart the development server retain their separate operation status surfaces.

## Source ownership

Each module maps its navigation items to real files and supplies file access and permissions. Prototype ownership, system context constraints, and platform file allowlists continue to apply. Contributors edit their own prototypes. Assigned maintainers edit their active systems. Admins edit platform, module, and Studio sources and manage all prototypes. The server rechecks current grants and archive status on each write. System identity and availability fields use managed system actions so references and dependent prototypes stay consistent. The editor does not grant permission or infer a prototype from a platform document.

Guide chapters and owner README documents have separate source files. Each reader edits its own complete Markdown document. Systems components expose Page, Examples, and Component file tabs. Systems overview and icon pages expose their overview source; generated theme pages expose their theme CSS. A system without an overview source exposes its declaration instead. Skills expose a file picker for `SKILL.md` and supporting files, preserving the skill’s directory structure.

## Implementation

- `src/platform/core/source/SourceEditor.tsx`: shared CodeMirror editor, syntax selection, save state, route blocking, and external-change handling. Its `SourceAccess` contract supplies a repository path, read/write callbacks, and editability.
- `src/platform/core/source/useSourceView.ts`: shared source URL state (`?mode=source`), keyboard toggle, and return focus.
- `src/platform/core/source/sourceTheme.ts`, `markdownSource.ts`, `mermaidSource.ts`: shared Flexoki highlighting, including Mermaid fences in Markdown. CSS theme files also receive syntax highlighting.
- `src/platform/app/source/ArtifactSource.tsx`: prototype and system context access adapter.
- `src/platform/app/shell/FileNavItem.tsx` and `FileActionItems.tsx`: file-backed navigation and common actions. File trees use the same actions with their own structure.
- `scripts/build/files/source.js`: versioned, size-limited access to explicitly allowlisted Documentation and Systems files. Prototype and system context access retain their existing file policies.
