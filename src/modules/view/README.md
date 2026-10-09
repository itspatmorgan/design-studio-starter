# Views

The required Views module opens `.tsx` and `.jsx` artifacts as actual React components. Each view exports a component as its default export. Underscore helpers are excluded from navigation.

The loader inventories prototype roots and registered module sections. Capabilities follow the shared [file-type contract](../../platform/context/file-types.md). Assignments and source dependencies follow [Prototypes](../prototypes/README.md).

## Preview boundary

Studio loads an artifact descriptor. It does not import or render the prototype component in its document. `ViewFrame` and `ViewEmbed` use `preview/PreviewHost.tsx`; the iframe bootstraps `preview/main.tsx` and loads the real view through `loadView`. `PreviewSurface` owns assigned-system themes, lo-fi mode, navigation scope, portals, and React error containment.

The child uses the published `index.html` entry with validated `studio-preview=1`, session, and configuration parameters. This works with the same Vite development server and static base path as Studio, without another HTML deployment entry. The platform entry chooses the runtime before importing Studio's router. Preserve this separation.

A page runtime persists between views of the same prototype. Changing prototype identity tears down the document and creates a new session. Color-mode updates preserve the runtime and component state. Source editing retains an already-open page runtime in a hidden, inert host container; HMR continues there. Directly opening source mode does not require a working preview.

Embeds have their own child documents. They use a 1440px layout viewport, scale and crop to their supplied dimensions, exclude focus and pointer interaction, and set the child root inert. They cannot request host navigation or shortcuts. Invalid or zero dimensions do not mount a runtime.

## Communication and authority

`preview/protocol.ts` defines version 1 of the `studio-preview` channel:

| Direction | Message | Purpose |
| --- | --- | --- |
| Host → child | configure | Explicit artifact target, public href, color mode, and immutable page/embed surface |
| Child → host | hello | Same-session bootstrap/reload handshake; host supplies its current target |
| Child → host | status | Loading, successful render commit, or error; bounded detail and render-attempt counter |
| Child → host | navigate | Same-origin Studio address and replace/push intent |
| Child → host | shortcut | Eligible source/grid shortcut, forwarded to existing host handlers |

Both sides validate sender window, exact origin, version, session, fresh child-document runtime identity, message kind, and payload fields. Host status/navigation/shortcut messages must match the currently selected artifact identity. Only hello can announce an earlier bootstrap identity after a same-session runtime reload. Configuration identity must match its target; the surface cannot change during a session. Stale document and render-attempt notifications are ignored. Hidden source-mode previews cannot request navigation or shortcuts.

Targets use permanent prototype/artifact IDs when available, resolved against the current manifest. Registered section artifacts without IDs use explicit owner/path selectors. Source paths locate imports; they do not grant authority. There are no file-write, arbitrary execution, or inspection commands in this protocol.

After validation, status emits a bubbling `studio:preview-state` event from the host boundary with `session`, `runtime`, `identity`, `surface`, `state`, and `render`. Boundary data attributes expose current state, identity, and session for native inspection. This is the integration point for #19 and future inspection modules. The counter identifies runtime load attempts, **not** a source revision or a source-to-component map. Future protocol extensions must add explicit validation and retain independent write authorization.

The child memory router supplies normal TanStack hooks to prototypes. Page navigation is handed to Studio so its history, artifact selection, source mode, and outer routes remain authoritative. Hash anchors stay within the child document. External HTTP(S) links open separately. The direct runtime can navigate React artifacts independently and returns to Studio for other surfaces; crossing prototypes starts a fresh document. Public prototype navigation APIs remain unchanged.

## Isolation limits

The iframe is same-origin and has no sandbox attribute. This is a trusted local repository execution boundary: separate document/CSS, viewport/focus APIs, module instances, and per-preview overlays. It is **not a hostile-code sandbox**. Scripts can access their parent, shared same-origin storage, and local server endpoints. CPU/process isolation and build/dependency isolation are separate concerns. Retain dependency/style checks and existing contributor/server authorization.

A stronger security boundary for untrusted code requires a separate origin, asset/CORS and network/server policy, and harness verification. Adding allow-scripts plus allow-same-origin would not establish that protection. See [MDN's iframe reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe).

## Development, inspection, and recovery

Each child receives Vite HMR and manifest/file-loader notifications. Pending loads are cancelled logically so stale responses cannot replace the current artifact. Ordinary component updates preserve Fast Refresh state; missing/incomplete files and source repair use the existing loader and error handling.

Native browser tooling can inspect and interact with real elements inside a page iframe. Codex's in-app browser is verified; Cursor, ChatGPT, and other harnesses require their own browser-tool checks. DOM access does not establish component/props inspection.

Right-click a View and choose **Open preview directly** for a fresh, independently inspectable runtime of that artifact. It retains actual source and assignment; it does not copy the current interaction state. An unresponsive page preview also offers that fallback after a bounded wait. Embeds remain inert even when a harness can inspect their DOM.

React render errors stay in the preview's error UI. Loading failures show an actionable error in the child, preserving Studio's source editor. Uncaught errors and rejected promises report error state; they do not automatically replace the component or recover exhausted CPU resources.

## Research and verification

The investigation record at `scripts/experiments/preview-boundary/README.md` compares the parent portal and child runtime on real prototypes, with reproduction instructions and pinned OpenDesign/Open CoDesign references. [TanStack memory history](https://tanstack.com/router/latest/docs/guide/history-types) supplies the independent navigation context. Borrow execution separation and explicit bridge authority, while retaining Studio's real React authoring model.
