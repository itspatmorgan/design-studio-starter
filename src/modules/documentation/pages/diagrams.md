---
title: Diagrams
description: Map the flow behind your screens and make missing decisions visible.
section: Prototypes and artifacts
order: 11
module: diagrams
toc: true
---

A diagram explains how an experience fits together. Use one to map a customer flow, compare branches, or show responsibilities that are hard to understand from screens alone.

## Map your prototype's flow

Continuing Checkout exploration, ask:

> Add a diagram showing the checkout from basket review through delivery and payment. Include the empty-basket and declined-payment branches. Match the behavior currently demonstrated, and identify any missing decisions.

Open the diagram in the prototype's navigation. Follow each branch and compare it with the screens. Does the diagram explain the same experience? Are there paths that the prototype does not demonstrate yet?

To revise it, describe the change:

> Show how a customer retries payment while keeping their delivery choice. Keep the diagram focused on customer actions.

Diagrams and screens are separate artifacts. Ask the agent to update both when a flow changes.

## Choose how to use it

A standalone diagram has its own navigation entry. When Documents or Canvases is enabled, you can ask the agent to show that same diagram in a document or on a canvas. Local changes to its source update those previews.

For a small diagram that belongs only inside an explanation, ask the agent to put it directly in a document instead. That diagram stays part of the document.

## Create and edit directly

Ask your agent to create one, or select **New** (+), then **New diagram**, in the Artifacts row.

Studio uses **Mermaid**, a text format for diagrams. You can direct the agent in plain language without learning its syntax. To inspect or change the text, right-click the diagram and choose **Edit source**. Save with **⌘S / Ctrl+S**, then select **Done**.

If invalid syntax shows an error, copy the message to your agent and explain what the diagram should show. Published diagrams and other contributors' files are read-only.

Diagrams follow Studio's light or dark appearance. For syntax examples and visual customization, ask your agent to consult [Diagrams and code](/documentation/context/platform.core/context/diagrams).

## Sketch an alternative

If Canvases is enabled, Excalidraw's **More tools → Mermaid to Excalidraw** can turn copied Mermaid text into editable shapes. Those shapes become an independent sketch. Editing them does not update the original diagram.

## Optional capability

Disabling Diagrams preserves its files and hides standalone diagrams from normal navigation. Their previews become unavailable until it is enabled again. Diagrams placed directly inside Markdown documents still work without this module.
