---
title: Start here
description: Explore how context, diagrams, screens, and canvases work together in a prototype.
toc: true
---

This sample is a small feedback tracker and an introduction to the studio. Everything in the navigation is a file you can open, edit, or ask your agent to change. The folders tell the story of this example; they don't enforce a workflow.

## Take a short tour

### 1. Explore the idea

Start with [Project context](explore/project-context.md): the problem, the people it serves, decisions, and open questions. It embeds the [Feedback flow](explore/feedback-flow.mermaid), a low-fidelity screen, and the Breadboard canvas from their original files.

Open [Breadboard](explore/breadboard.excalidraw) to compare a live diagram with the same flow converted into editable Excalidraw shapes. The live embed follows the Mermaid source; the converted sketch is independent. Try moving a shape or adding a note.

The [Lofi inbox](explore/lofi-inbox.tsx) shows the working inbox in grayscale with handwritten type. It demonstrates how you can discuss layout before polish.

### 2. Try the app

Open [Overview](app/overview.tsx), then click **Open issues** to reach the [Feedback inbox](app/feedback-inbox.tsx). Add feedback, open an item in [Feedback detail](app/feedback-detail.tsx), change its status, or add a note.

The screens share sample data. Reloading resets it, as does **Reset sample data** in the app's navigation. The screens use the Product design system; the studio around them uses its own interface.

### 3. Inspect specific states

The **States** folder groups examples by screen. Open [Inbox / Empty](states/inbox/empty.tsx), [Inbox / Validation error](states/inbox/validation-error.tsx), or [Detail / Delete confirmation](states/detail/delete-confirmation.tsx).

These are small views that reuse the app screens with a chosen starting state. They let you discuss a specific situation without clicking through the app to reproduce it. Try comparing **New feedback** with **Validation error**.

### 4. See the handoff

Open [Eng handoff](handoff/eng-handoff.excalidraw). It arranges live screens and states with notes for engineering. Open an embedded screen using its header; edit the original and its previews follow.

Try dragging a view or diagram from the navigation onto a canvas. Documents appear as link cards. A canvas includes files from its own prototype, keeping the example self-contained.

## How this example works

| File type | What it contributes |
| --- | --- |
| Document (`.md`) | Written context, decisions, and references, with file previews alongside the writing. |
| Diagram (`.mermaid`) | A portable system model that documents and canvases can preview. |
| View (`.tsx`) | An interactive screen or a specific state of one. |
| Canvas (`.excalidraw`) | A place to arrange previews, sketches, and notes together. |

Previews reference the original files. Their headers open those files for interaction or editing. Documents can preview views, diagrams, and canvases; other documents appear as cards. Canvases preview views and diagrams, with documents and other canvases shown as cards.

Right-click a file and choose **Edit source** to see its text. While running locally, save edits with Command+S on macOS or Ctrl+S elsewhere, then select **Done**. Try changing a heading in the inbox, or a label in the diagram, and check its previews.

The Lofi inbox has `/** @lofi */` at the top of its source. That marker changes its appearance while preserving components and behavior. **Make lofi** and **Make hi-fi** in a view's menu toggle it; the Explore folder is only an organizing choice.

Shared screen code lives in `app/_components`. Underscore folders contain helpers and stay out of normal navigation. Use **Show all files** in the prototype's **…** menu to inspect them. **Reveal in Finder** shows the same folder on disk.

## Make it yours

Ask your agent to change something concrete: “add a due date to feedback,” “explore a different inbox layout,” or “put the empty state beside the main screen on the handoff canvas.” Point it at Project context so the changes have a reason behind them.

For more detail, open the [Guide](/documentation/guide). The [Handbook](/handbook/context) holds the team's shared context; this prototype holds context specific to the feedback tracker.

When you're ready, create your own prototype from the Prototypes page. You can keep this sample as a reference, archive it to leave it out of the deployed site, or delete it from its **…** menu.
