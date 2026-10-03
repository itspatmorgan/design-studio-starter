---
title: Start here
description: A short tour of this sample prototype, and how to make it yours.
toc: true
---

Welcome. This is a working prototype, small enough to read in one sitting. It exists to show how a prototype is put together, so open things as you read and change what you like. Everything here is yours to edit or delete.

**When you're done with the tour,** delete this prototype: choose **Delete** in its **…** menu, or ask your agent to. Then start your own with **New prototype** on the Prototypes page.

## 1. The files on the left

The navigation shows the prototype's folder as it is on disk. Choose **Reveal in Finder** in the **…** menu to see for yourself: what you see here is what's in the folder.

- A **view** is a screen: a `.tsx` file, like [Feedback inbox](app/feedback-inbox). This prototype has three screens in the `app` folder, and a view for each state in the `states` folder.
- A **document** is a page of writing: a `.md` file, like this one and [Project context](project-context).
- A **canvas** is a page to arrange things on: an `.excalidraw` file, like [Breadboard](breadboard) and [Eng handoff](eng-handoff).
- A **folder** only organizes. Move files between folders, and nothing about them changes.

The star beside this page means the prototype opens here. Right-click another file and choose **Set as start** to change it.

## 2. The screens

Open the [Overview](app/overview). It's the landing page, with the key numbers at the top. Click **Open issues** and you land in the [Feedback inbox](app/feedback-inbox), already narrowed to everything not resolved. Then add feedback with **New feedback**, click a row, change its status, add a note, delete something. The three screens share one set of data, so a change in one shows up in the others. Reloading the page resets it, and so does **Reset sample data** in the corner.

The screens use the **Product** design system, the same components your team's product would use. Open the **Systems** page from the rail to see them and their themes. The Product system looks different from the app around it on purpose.

## 3. Switch to Source

Right-click any file in the navigation and choose **Edit source** to see its text. In the dev server you can edit it right there and save with ⌘S, then press **Done** to go back to the page. The change shows up straight away. Try changing a title in [Feedback inbox](app/feedback-inbox).

## 4. The helpers folder

Look inside the `app` folder with **Show all files** in the **…** menu. There's a `_components` folder: the data, the top bar, and the form the screens share. A name that starts with an underscore marks a helper, not a screen, so it never appears in the navigation. They're how three screens share one set of pieces without repeating them.

## 5. Lofi is a switch on a view

The [lofi feedback inbox](lofi/feedback-inbox) is the real [Feedback inbox](app/feedback-inbox) with `/** @lofi */` at the top of its file. That one line is the whole feature: the screen keeps its design system's components and is drawn in grayscale with handwritten type, for the stage when you are deciding the layout and polish would only distract. Right-click any view in the navigation and choose **Make lofi** to try it, and **Make hi-fi** to undo it. The folder it sits in is only a name.

Sketching with plain shapes and no design system is fine too, when an idea isn't ready for real components.

## 6. Think on a canvas

This prototype has two canvases, for two moments.

- [Breadboard](breadboard) is for early ideas. It uses only Excalidraw's own shapes, a flowchart of the key workflows and of the logic behind create, read, update, and delete: ovals for starts and ends, boxes for screens, diamonds for decisions, arrows for what the person does. It looks rough on purpose, so nobody mistakes it for a spec.
- [Eng handoff](eng-handoff) is for when the design is settled. It shows the real screens live: the main flow first, then each create, read, update, and delete state, with a yellow note under each saying what engineering needs to know.

Drag any view from the navigation onto a canvas, or ask your agent to lay something out. A canvas shows only this prototype's own screens, so a prototype stays self-contained. To show a screen from another prototype, copy it in.

## 7. A view for every state

A screen has more states than the one you land on: filtered, empty, a panel open, a dialog asking first. Each of those is a small file in the `states` folder that shows the same screen already in that state. [Feedback inbox, open issues](states/feedback-open-issues) is the page after clicking Open issues on the overview. [Feedback inbox, empty](states/feedback-empty) runs on data of its own. They're ordinary views, so you can open them, and a canvas can embed them. That's how the handoff canvas shows a closed panel and an open one side by side.

## 8. Write down the why

[Project context](project-context) is the document this prototype's agent should read first: the problem, who it's for, and what you've decided. A few honest paragraphs beat a long spec.

## 9. Work with your agent

Your agent can build and change all of this: "add a due date to feedback," "make the overview show a chart," "write up the open questions as a document," "put the new screen on the handoff canvas." It reads the same files you see.

## 10. When something's finished

Archive a prototype from its **…** menu to keep it but leave it out of the deployed site. To tidy files inside a prototype, put them in a folder.

## 11. Reuse without coupling

A prototype never imports from another prototype. To reuse something, link to it, ask your agent to copy it into your folder, or share a reusable piece through the design system or `src/lib/`. Each prototype stays safe to change, rename, or delete.

## Make it yours

- Change the colors in `src/systems/product/styles/theme.css` and every screen follows.
- Open the [Guide](/documentation/guide) when you want the long version of anything above.
- Ask your agent: "set me up" if you haven't joined yet.

## Feedback flow

The [feedback review diagram](feedback-flow.mermaid) models how feedback moves from capture through review to resolution. It opens when the optional Diagrams module is enabled.
