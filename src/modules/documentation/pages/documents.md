---
title: Documents
description: Keep audience notes, decisions, and explanations beside your screens.
section: Prototypes and artifacts
order: 12
module: document
toc: true
---

A document holds the thinking behind a prototype: a brief, research notes, decisions, or an engineering handoff. It stays with the screens it explains.

## Record the audience and goal

Continuing Checkout exploration, give your agent the notes you have:

> Add an Audience and decisions document to this prototype. Summarize these notes about first-time customers and their concerns about delivery costs. Separate supported insights from assumptions and open questions. Explain how they influenced the checkout.

If you have no research yet, ask for a working audience description labeled as an assumption. The agent should not invent customer evidence.

Review the document. Does it accurately represent what you supplied? Could another person understand the goal without reading your chat?

## Connect the explanation to the work

If the corresponding tools are enabled, ask:

> Link to the checkout's main screens and flow diagram from the document. Add previews where they help explain the decisions.

A document can show previews of views, diagrams, and canvases from the same prototype. Open the original artifact to interact or edit. The preview references the original file, so local changes appear without copying its content. Other documents appear as link cards.

Keep decisions specific to this exploration here. Knowledge that should guide many prototypes belongs in your system's [product context](/documentation/guide/agent-context).

## Create and edit directly

Ask your agent to create or revise a document, or select **New** (+), then **New document**, in the Artifacts row.

Documents use Markdown, plain text with simple formatting marks. To edit locally:

1. Right-click the document and select **Edit source**.
2. Change the text.
3. Save with **⌘S / Ctrl+S**.
4. Select **Done** to return to the page.

Documents support headings, lists, links, tables, task lists, code blocks, and Mermaid diagrams. They use Studio's reading style. Other contributors' documents and published pages are read-only.

## Optional Markdown examples

To link to a view, use its relative file path:

```md
Try the [checkout](./checkout.tsx).
```

To show a preview, put image syntax on its own line:

```md
![Checkout](./checkout.tsx)

![Checkout flow](./checkout-flow.mermaid)

![Review canvas](./review.excalidraw)
```

Replace these example filenames with your prototype's files. File previews stay within the same prototype and require the corresponding capability. Ask the agent to fix a missing or unavailable reference.

Your agent can also add a title, description, or contents list. It can consult [Documents context](/documentation/context/module.document) for file behavior.

Documents is an optional capability. Disabling it preserves the files and hides them from prototype navigation. System context and the Guide remain separate.
