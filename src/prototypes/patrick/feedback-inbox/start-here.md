---
title: Start here
description: A short tour of this sample prototype, and how to make it yours.
toc: true
---

Welcome. This is a working prototype, small enough to read in one sitting. It exists to show how a prototype is put together, so open things as you read and change what you like. Everything here is yours to edit or delete.

**When you're done with the tour,** delete this prototype: choose **Delete** in its **…** menu, or ask your agent to. Then start your own with **New prototype** on the Prototypes page.

## 1. The files on the left

The navigation shows the prototype's folder as it is on disk. Choose **Reveal in Finder** in the **…** menu to see for yourself: what you see here is what's in the folder.

- A **view** is a screen: a `.tsx` file, like [Inbox](app/inbox). This prototype has three of them in the `app` folder.
- A **document** is a page of writing: a `.md` file, like this one and [Project context](context).
- A **canvas** is a page to arrange things on: an `.excalidraw` file, like [Workflows](workflows).
- A **folder** only organizes. Move files between folders, and nothing about them changes.

The star beside this page means the prototype opens here. Right-click another file and choose **Set as start** to change it.

## 2. The screens

Open the [Inbox](app/inbox). Try it: add feedback with **New feedback**, click a row, change its status, add a note, delete something. The three screens share one set of data, so a change in one shows up in the others. Reloading the page resets it, and so does **Reset sample data** in the corner.

The screens use the **Product** design system, the same components your team's product would use. Open the **Systems** page from the rail to see them and their themes. The Product system looks different from the app around it on purpose.

## 3. Switch to Source

Hover over **Files** and click the code icon to see any file's text. In the dev server you can edit it right there and save with ⌘S. The change shows up straight away. Try changing a title in [Inbox](app/inbox).

## 4. The helpers folder

Look inside the `app` folder with **Show all files** in the **…** menu. There's a `components` folder: the data, the top bar, and the form the screens share. Files in a folder called `components` are helpers, not screens, so they never appear in the navigation. They're how three screens share one set of pieces without repeating them.

## 5. Sketch first

The [lofi sketch](lofi/inbox-sketch) is a rough, gray version of the inbox from before it was designed. A `lofi` folder is just a habit. Rough work comes first, and it's quick to throw away.

## 6. Put it all on one page

Open [Workflows](workflows). It's a canvas: the real screens, shown live, with arrows and sticky notes between them. Drag any view from the navigation onto it, or ask your agent to lay something out. A canvas shows only this prototype's own screens, so a prototype stays self-contained. To show a screen from another prototype, copy it in.

## 7. Write down the why

[Project context](context) is the document this prototype's agent should read first: the problem, who it's for, and what you've decided. A few honest paragraphs beat a long spec.

## 8. Work with your agent

Your agent can build and change all of this: "add a due date to feedback," "make the overview show a chart," "write up the open questions as a document," "put the new screen on the workflows canvas." It reads the same files you see.

## 9. When something's finished

Archive a prototype from its **…** menu to keep it but leave it out of the deployed site. To tidy files inside a prototype, put them in a folder.

## Make it yours

- Change the colors in `src/systems/product/styles/theme.css` and every screen follows.
- Open the [Guide](/guide) when you want the long version of anything above.
- Ask your agent: "set me up" if you haven't joined yet.
