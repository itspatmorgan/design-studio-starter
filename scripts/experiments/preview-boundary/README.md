# Preview boundary investigation — issue #18

Status: initial compatibility experiment, not a production boundary decision. Branch `codex/18-preview-boundary` starts from merged main `2ec2991`. [Issue #18](https://github.com/itspatmorgan/design-studio-starter/issues/18) retains its uncompleted implementation criteria.

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

## Next experiment and acceptance gates

Build a temporary artifact-only runtime and compare it with the parent-portal candidate on representative real prototypes. Measure CSS leakage, CSS and JavaScript breakpoints, fonts, assigned-system modes, portals/focus, internal and external navigation, HMR, and errors. Test full-page and canvas/document embed surfaces plus a directly opened preview.

Define a small versioned host–preview message contract with validated sender window, origin policy, artifact identity, preview-session identity, payload bounds, and readiness/error/navigation events. Keep file-write operations out of this contract. Provide explicit lifecycle and inspection integration points without implementing issue #19 or the inspector. Decide the production model only after this evidence exists.

## Public execution references

- [OpenDesign FileViewer](https://github.com/nexu-io/open-design/blob/802708f6c9f294347ef777b1fda49b9cbe26ef72/apps/web/src/components/FileViewer.tsx) and [srcdoc construction](https://github.com/nexu-io/open-design/blob/802708f6c9f294347ef777b1fda49b9cbe26ef72/apps/web/src/runtime/srcdoc.ts): inspected snapshot uses distinct iframe execution surfaces, bridges, and surface-specific sandbox choices. Its generated HTML runtime is not directly interchangeable with Studio's real React authoring model.
- [Open CoDesign source editing](https://github.com/OpenCoworkAI/open-codesign/blob/main/SOURCE_EDITING.md): preview instrumentation, revision-bound selection, and separate write authorization. This documents its behavior; it is not an audit of its security implementation.
