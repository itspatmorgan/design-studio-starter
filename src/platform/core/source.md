# Source editing

Source editing is a shared platform capability used by Prototypes, Handbook, Documentation, and Systems. It has no separate module, route section, or navigation entry.

## File workflow

Right-click a file-backed navigation item to **Edit source** or **View source** when read-only. Its menu also exposes **Open in editor**, **Reveal in Finder**, **Copy link**, and **Copy path**. Module-specific actions such as renaming remain subject to that module's permissions.

Locally, **⌘' / Ctrl+'** toggles the selected page between rendering and source. The editor receives focus when opened; returning focuses the rendered content. **⌘S / Ctrl+S** saves. **Done** also returns to the rendered view. **⌘; / Ctrl+;** toggles navigation in either view.

Returning or navigating away with unsaved changes requires confirmation. External edits reload clean editors and offer a conflict choice when local changes are unsaved. Saving checks the version read from disk before writing.

Source editing is available during local development. Published pages retain their reading experience and copying actions without repository editing.

## Source ownership

Each module maps its navigation items to real files and supplies file access and permissions. Prototype ownership, Handbook constraints, and platform file allowlists continue to apply. The editor does not grant permission or infer a prototype from a platform document.

Guide and Reference edit the complete underlying Markdown file, including README developer sections hidden from the Guide. Systems components expose Page, Examples, and Component file tabs. Systems introduction and icon pages expose their introduction source; generated foundation pages expose their theme CSS. A system without an introduction exposes its declaration instead.

## Implementation

- `source/SourceEditor.tsx`: shared CodeMirror editor, syntax selection, save state, route blocking, and external-change handling. Its `SourceAccess` contract supplies a repository path, read/write callbacks, and editability.
- `source/useSourceView.ts`: shared source URL state (`?mode=source`), keyboard toggle, and return focus.
- `source/sourceTheme.ts`, `markdownSource.ts`, `mermaidSource.ts`: shared Flexoki highlighting, including Mermaid fences in Markdown. CSS theme files also receive syntax highlighting.
- `src/platform/app/source/ArtifactSource.tsx`: prototype and Handbook access adapter.
- `src/platform/app/shell/FileNavItem.tsx` and `FileActionItems.tsx`: file-backed navigation and common actions. File trees use the same actions with their own structure.
- `scripts/build/files/source.js`: versioned, size-limited access to explicitly allowlisted Documentation and Systems files. Prototype and Handbook access retain their existing file policies.
