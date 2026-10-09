# Preview boundary investigation — issue #18

Status: artifact-only comparison completed; child-runtime recommendation recorded. Production integration and cross-harness acceptance remain open. Branch `codex/18-preview-boundary` starts from merged main `2ec2991`. [Issue #18](https://github.com/itspatmorgan/design-studio-starter/issues/18) retains its uncompleted implementation criteria.

## Question

Can a separate preview document preserve real React prototypes and native harness interaction? Start with the unchanged application to establish compatibility constraints before designing an artifact-only runtime. This fixture embeds the **whole Studio**, including its shell. It is not an artifact runtime, a reusable preview implementation, or a security demonstration.

## Reproduce

Use the isolated branch checkout. The fixture uses the starter Feedback Inbox overview as its representative real prototype. Change its `frame.src` and initial iframe URL together when using another identified artifact.

1. Confirm `src/preview-boundary-experiment.html` does not already exist. Copy `scripts/experiments/preview-boundary/fixture.html` there temporarily.
2. Run `pnpm dev --host 127.0.0.1 --port 5197` and open `/preview-boundary-experiment.html`.
3. With **Same-origin document**, inspect and interact with the nested prototype using native harness tools. Open **Open issues**, then **New feedback**. Cancel without submitting.
4. Use **Narrow frame** and **Wide frame** to investigate responsive behavior. The current fixture includes Studio navigation, so its artifact width is smaller than the iframe width.
5. Choose **Opaque sandbox**, which remounts the application with `sandbox="allow-scripts"`. Record rendering and diagnostics. Do not add permission flags just to make the experiment pass.
6. Restore the same-origin option and remove only the temporary copied HTML file when done. Prototype content is never edited by this experiment.

## Observed on 2026-10-09

Native Codex browser interaction verified:

| Candidate | Observation | Meaning |
| --- | --- | --- |
| Same-origin iframe, no sandbox | Real Feedback Inbox overview rendered. Nested DOM inspection exposed its controls. Clicking Open issues navigated within the child; the parent experiment stayed in place. | Native iframe inspection and prototype navigation work for this case. |
| Same-origin iframe, no sandbox | New feedback dialog opened within the child, with Title focused and system components visible to inspection. No feedback was submitted. Fixture removal triggered a host reload before a separate Cancel check could complete. | One real modal/focus path works. This does not establish all portal behavior. |
| Opaque-origin iframe, `allow-scripts` only | The nested application remained blank after initial navigation and a subsequent observation. | Wrapping the unchanged Studio this way is not a compatible baseline. Cause is not yet isolated; parent log inspection reported no captured errors. |

Narrow/wide controls were exercised; detailed breakpoint measurements, screenshots, font fidelity, theme modes, HMR, error containment, multiple real prototypes, direct artifact preview, and other harnesses remain unverified. Do not treat this result as rollout approval.

## Options to investigate next

| Option | Expected benefit | Main question |
| --- | --- | --- |
| Consolidate current in-document rendering | Shared portal, theme, and error handling with minimal compatibility change | Global CSS and document APIs remain shared; does this meet the isolation goal? |
| Render parent-loaded React into an iframe with a portal | Separate DOM/CSS layout while retaining parent React context | Components still execute in the parent JavaScript realm. Browser globals and viewport APIs may refer to the host. Verify this explicitly. |
| Artifact-only runtime bootstrapped in a same-origin iframe | Real child-document viewport, CSS, focus, and global APIs | Replace host-router assumptions deliberately; preserve assigned systems, assets, HMR, and inspectability. This is document isolation, not hostile-code isolation. |
| Artifact-only runtime on a separate origin or opaque origin | Stronger browser separation from Studio | Asset/CORS, module loading, storage, local server access, publication, and harness compatibility need deliberate design. |

A same-origin iframe is not a security boundary against its own scripts. Adding both `allow-scripts` and `allow-same-origin` does not make same-origin content a reliable sandbox. [MDN's iframe reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe) documents these choices. Evaluate document, browser security, and build/dependency isolation separately.

## Repository constraints found

- Full-page `ViewFrame` and `ViewEmbed` separately assemble theme, portal, and error boundaries. The shared implementation belongs to Views and should preserve intentional differences between interactive pages and inert embeds.
- Real prototypes use TanStack Router hooks directly. An independent runtime needs an explicit compatible navigation adapter rather than assuming host React context survives a new JavaScript realm.
- `ThemeScope` observes its realm's `document.documentElement`. An independent runtime must receive and apply color mode deliberately.
- Prototype dialogs use the shared portal context. A runtime must establish a child-document portal container before prototype overlays can open.
- Preserve source components and the existing loader/system dependency policy. Do not flatten prototypes into generated HTML.

## Production acceptance gates

The artifact-only comparison below covers two real prototypes. Before rollout, test the shared production implementation on full-page and canvas/document embed surfaces, including source edits, missing systems, no-system views, lo-fi views, navigation outside the current prototype, keyboard focus restoration, and production/static publication. Verify other supported harnesses rather than extrapolating from Codex.

Define a small versioned host–preview message contract with validated sender window, origin policy, artifact identity, preview-session identity, payload bounds, and readiness/error/navigation events. Keep file-write operations out of this contract. Provide explicit lifecycle and inspection integration points without implementing issue #19 or the inspector. Treat the recommendation below as the preferred implementation direction, conditional on these acceptance gates.

## Public execution references

- [OpenDesign FileViewer](https://github.com/nexu-io/open-design/blob/802708f6c9f294347ef777b1fda49b9cbe26ef72/apps/web/src/components/FileViewer.tsx) and [srcdoc construction](https://github.com/nexu-io/open-design/blob/802708f6c9f294347ef777b1fda49b9cbe26ef72/apps/web/src/runtime/srcdoc.ts): inspected snapshot uses distinct iframe execution surfaces, bridges, and surface-specific sandbox choices. Its generated HTML runtime is not directly interchangeable with Studio's real React authoring model.
- [Open CoDesign source editing](https://github.com/OpenCoworkAI/open-codesign/blob/main/SOURCE_EDITING.md): preview instrumentation, revision-bound selection, and separate write authorization. This documents its behavior; it is not an audit of its security implementation.

## Artifact-only comparison — 2026-10-09

**Recommendation: bootstrap React inside an artifact-only iframe**, initially on the same local origin for the trusted repository workflow. Share one runtime foundation across page previews and embeds. Do not render parent-loaded React into that iframe as the default boundary.

The decisive difference is execution location, not whether an iframe appears in the DOM. In a portal, the DOM moves to a new document but ordinary JavaScript globals still refer to Studio's window/document. In a child runtime, the component executes against its actual preview window/document. [React's portal contract](https://react.dev/reference/react-dom/createPortal) explains that a portal changes physical DOM placement while retaining the React tree's context and event behavior.

### Candidates and real content

- Parent portal: real React components loaded in the host and rendered into an about:blank iframe with cloned Vite styles. No sandbox.
- Child runtime: a new React root, actual view loader, theme/portal/error wrapper, and independent memory router bootstrapped by the iframe URL. Same origin, no sandbox. No Studio shell.
- Both use the unchanged Feedback Inbox overview/inbox (Product system) and landing-v1 (Marketing system), actual registered identities, assigned components, and imported styles. The router resolves real prototype navigation hooks. This is not generated standalone HTML.

### Results

| Check | Parent portal | Child runtime |
| --- | --- | --- |
| Frame at 420px; host at 1280px | CSS mobile; JS sees 1280px and reports desktop | CSS mobile; JS sees 418px and reports mobile |
| Frame at 900px | CSS desktop; JS still sees 1280px | CSS desktop; JS sees 898px |
| Native focus probe | Local active element INPUT; global active element IFRAME | Both active-element checks report INPUT |
| Controlled document-level CSS injection | Global document style underlines the host heading, not the preview heading | Style underlines only its preview heading |
| Feedback Inbox navigation | Overview → Open issues reaches the real filtered inbox; host stays on the comparison | Same behavior |
| Real Product dialog | Dialog stays in preview; Title autofocus and Cancel work when tested independently | Same behavior |
| Marketing demo interaction | Mark resolved updates the visible status | Same behavior |
| Assigned themes and fonts | Both prototypes visually rendered in light/dark; Marketing heading uses Geist Variable | Matching rendering; same computed Marketing font and light text color |
| Real source edit through Vite HMR | Temporary Overview heading edit appears without manual reload | Same behavior |
| Controlled React render failure | Existing ViewError fallback appears; host width control still works | Same behavior |
| Repair after controlled failure | Overview returns without manual reload | Same behavior |
| Codex DOM/browser tooling | Both nested documents expose controls and support native clicks/inspection | Same; direct runtime page additionally rendered and navigated successfully |

Actual frame widths exclude their two-pixel border. Viewport/focus and CSS-injection checks are small explicit probes alongside real views; the existing prototypes are not claimed to exercise every browser API themselves. Product's existing header overflows the narrow frame in both candidates; the boundary does not repair prototype responsiveness.

An Escape press did not dismiss the tested child modal before a later theme remount reset it. Both independent Cancel checks passed. Escape/focus restoration need comparison with the production baseline and explicit acceptance coverage; they are not asserted as passing.

The temporary heading and render-error edits were restored byte-for-byte and leave no prototype diff. No feedback was submitted. Early edits to the fixture itself produced duplicate-root warnings; its entry now disposes the root and injected host style on HMR. This differs from the successful real-prototype HMR check. The copied runtime also passes the project's TypeScript check; it explicitly types its local loader because the experiment reuses public route paths registered to Studio's different loader.

### Harness and security boundaries

The native Codex browser could inspect, screenshot, focus, and click real elements in both candidates. Only Codex was exercised. DOM access does not prove component/props source mapping; future inspection remains a separate module. Keep an independently openable artifact runtime for harnesses with limited nested-frame tooling.

Same-origin child execution gives separate documents, CSS layout, viewport/focus APIs, and module instances. It does **not** protect against hostile repository code: it can access its parent, shared same-origin storage, and local server endpoints. It is not CPU/process isolation or separate build/dependency isolation. Retain existing import/style checks and contributor authorization. The message bridge alone cannot restrict same-origin scripts' authority.

For this trusted local authoring workflow, record no sandbox as the compatibility baseline rather than label it a security sandbox. Do not add allow-scripts + allow-same-origin and claim stronger protection. Stronger security for untrusted imports requires a separately designed origin, server/network authority, CSP/asset strategy, and harness compatibility test. The earlier opaque-origin whole-app failure is not evidence that an artifact-only opaque-origin runtime is impossible.

### Production shape and remaining work

1. Views owns a shared preview host plus child entry; reuse existing loaders and assigned-system rules. Page/embedded controls intentionally differ, while runtime assembly remains common.
2. Keep a compatible, typed child router. [TanStack memory history](https://tanstack.com/router/latest/docs/guide/history-types) supplies independent navigation; validate requests to the host for outer Studio routes. Deliberately synchronize the selected artifact and public address.
3. Version the bridge; verify sender window, explicit origin, artifact ID, session ID, supported message kinds, and bounded payloads. Readiness, error reporting, theme/config changes, and navigation are its initial responsibilities. Keep file writes outside it.
4. Apply theme/viewport configuration without replacing the iframe. This experiment's dark-mode toggle changes the child URL/key and remounts it, resetting navigation and local state; that is a fixture limitation, not the intended lifecycle. Same-origin persistent storage is shared unless explicitly namespaced.
5. Integrate revision/session events with #19 and reserve inspection extensions. Avoid duplicating harness chat, agent activity panels, or coding tools. Separate runtime failures from missing/incomplete authoring states.
6. Validate embeds' inertness, overlay/focus handling, external links/hash links, static builds, and supported harnesses before replacing the production renderers. This experiment does not implement or approve those integrations.

OpenDesign's distinct preview execution surface informs the runtime separation. Open CoDesign's revision-bound instrumentation and independent write authorization inform the bridge's future identity/authority contract. Their generated HTML and security assumptions are not copied into React Studio.

### Reproduce the artifact comparison

Use this branch's isolated worktree. Confirm neither temporary file already exists before copying:

```sh
cp scripts/experiments/preview-boundary/compare.tsx src/preview-boundary-compare.tsx
cp scripts/experiments/preview-boundary/compare.html src/preview-boundary-compare.html
pnpm dev --host 127.0.0.1 --port 5197
```

Open /preview-boundary-compare.html. Select each prototype; exercise narrow/wide frames, the focus probe, CSS injection, color modes, real controls, and the direct-runtime link. Reload between CSS injection trials. A source-heading edit can test HMR; restore it immediately and verify the diff. A controlled throw can test the existing React error boundary; this does not prove asynchronous/uncaught failure or resource-exhaustion containment.

After closing the comparison, remove only the two temporary copied source files. The experiment sources remain under scripts/ and are excluded from the production application. Fixture HTML URLs depend on Studio's dev-server HTML handling, not a new published runtime route.
