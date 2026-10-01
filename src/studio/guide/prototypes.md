---
title: "Prototypes"
description: "What a prototype is, and how its folder turns into pages in the app."
section: "Core concepts"
order: 10
toc: true
---

A prototype is a folder in your space, `src/prototypes/<you>/`. The app finds it automatically. You never have to register it anywhere.

## The shape of a prototype

A file's type comes from its extension (`.tsx` files are views, `.md` files are [documents](/guide/documents), `.excalidraw` files are [canvases](/guide/canvases)), and folders are just for organizing, as deep as you like. Keep a flow's screens together in one folder, or sort them however makes sense to you.

```text
src/prototypes/patrick/hello-world/
├── meta.json        # title and description
├── prototype.tsx    # a view
├── notes.md         # a document
├── lofi/
│   └── main.tsx     # a view, in a folder
└── checkout/
    ├── steps/
    │   └── done.tsx # a view, two folders deep
    └── components/  # helpers, not views
```

Always create a prototype with `pnpm new "Prototype Name"`, by asking your agent for one, or with **New prototype** on the Prototypes page while the app runs locally. All three set it up the same way.

While the app is running locally, the prototype's navigation shows what you open and organize: its views, documents, canvases, and their folders, updating as they change. Helpers in `components/`, images, and `meta.json` (which the header edits for you) live beside them in the folder but stay out of the way. Choose **Show all files** in the **…** menu next to the prototype's title to list everything; those other files open in your code editor. Right-click any file to reveal it in Finder or copy its path. On the deployed site, the navigation lists just the views and documents.

In your own prototypes, the navigation works like a file browser:

- **New view, document, or folder:** the **+** next to the prototype's title, or right-click a folder. A new file starts working right away, and opens.
- **Rename:** right-click, or select a file and press F2.
- **Move:** drag a file or folder onto another folder, or onto the empty space below the list for the top level.
- **Delete:** right-click, or press Delete. It goes to the Trash, so you can put it back.
- **Read or edit the file:** right-click a view, document, or canvas and choose **Edit source** to see its text in place of its page. **Done** goes back to the page. In your own prototypes you can edit it and save with ⌘S; in other people's the menu says **View source** and it's read-only. Find (⌘F), go to line (⌘⌥G), and folding (the chevrons beside the line numbers) are built in. If your agent changes the file while it's open, the editor updates (or asks, if you have unsaved edits). Source is available while the app runs locally, not on the deployed site.
- **Choose what opens first:** right-click a view or document and choose **Set as start**. A small star marks what the prototype opens on.

Each of these is an ordinary change to the files, the same as your agent would make, so you can mix both ways of working. If you rename or move the file you're looking at, the app follows it, and `start` in `meta.json` is updated to match.
Everything about the prototype sits at the top of its navigation. The **…** menu next to the title (or a right-click) has everything else: **Show details** shows who made it, when, and its description, and the app remembers whether you leave them open. In your own prototypes, double-click the title to rename it, or choose **Edit** to change the title and description. It saves to `meta.json`. A new title also renames the prototype's folder to match ("Checkout Flow" becomes `checkout-flow`), so its link changes: the app takes you to the new address, but links you shared before stop working. If that folder name is already taken, nothing changes and the app says so. Editing only the description never renames the folder. **Delete** moves the whole folder to the Trash, so you can put it back.

## Views

A view is one screen of your prototype: any `.tsx` file that exports a React component, in any folder except `components/`.

The prototype opens on its first view, the one at the top of its navigation, unless you choose another with **Set as start**. That saves to `start` in `meta.json`.

## Lofi

When you're deciding a layout and polish would only distract, switch a view to lofi: right-click it in the navigation and choose **Make lofi**. The view keeps its design system's components exactly as they are, drawn in grayscale with handwritten type. **Make hi-fi** puts it back.

The switch is one line at the top of the view's file, `/** @lofi */`, so it follows the file when you rename or move it, and your agent can add or remove it. It applies to a single view, never a whole prototype. A folder called `lofi` is just a name.

## Folders

Folders are only for organizing, at any depth. A folder's name never changes what's inside it, with one exception: files in a `components/` folder are helpers, not views.

## Order

By default the navigation lists files first, then folders, each alphabetical. To put the important things at the top, drag a file or folder to where you want it: between two others to reorder, or onto a folder to move it inside. Dragging between two files in different folders does both. Without a mouse, Option + Up or Down arrow moves a focused row.

The arrangement is saved in `meta.json` as `order`, so everyone sees the same navigation, and your agent can change it too: ask it to put the overview first. Files you add later land after the ones you arranged. Order never renames or moves a file.

## Archiving

When a prototype is finished but you want to keep it, archive it instead of deleting it: choose **Archive** in its **…** menu. **Unarchive** brings it back.

While you work locally, nothing changes except that archived prototypes move to an **Archived** section at the bottom of the Prototypes page, and show "Archived" under their title. You can still open them. On the deployed site they're left out entirely: they aren't built, listed, or shipped, which keeps it fast. To keep something on the deployed site, leave it active and put it in a folder to get it out of the way.

If a canvas or document that stays on the site links to archived work, the build names the file, and the link shows a placeholder on the deployed site.

An archived prototype has `"status": "archived"` in its `meta.json`. Your agent can set it for you. To tidy views inside a prototype without archiving it, put them in a folder.

## meta.json

```json
{
  "title": "Hello World",
  "description": "A first prototype.",
  "created": "2026-09-28",
  "system": "product",
  "start": "lofi/main",
  "order": ["start-here.md", "lofi", "checkout"],
  "status": "archived"
}
```

Only `title` is required. `pnpm new` fills in `created`. Your name comes from `contributors.json`, so it isn't repeated here.

`system` is the [design system](/guide/systems) it builds with. Leave it out to use the default, which is all you need until your team has more than one.

`start` is the view the prototype opens on, written the way it appears in the URL. Leave it out to open on the first view. **Set as start** in the navigation sets it for you, and it follows the view if you rename or move it.

`order` is the [navigation's arrangement](#order): paths that go first, in sequence. Leave it out for the default.

`status` is `archived` to [set the prototype aside](#archiving). Leave it out for an active prototype, which is the default.

If `meta.json` is missing or broken, the app skips the prototype with a warning, and the build fails until it's fixed.

## URLs

Every view has its own link, so you can share exactly what you mean:

| URL | Opens |
| --- | --- |
| `/patrick/hello-world` | The view it opens on |
| `/patrick/hello-world/prototype` | A view |
| `/patrick/hello-world/lofi/main` | A view in a folder |
| `/patrick/hello-world/checkout/steps/done` | A view, two folders deep |

## When a view breaks

If a view throws an error, the app shows the error with a Copy button, and everything else keeps working. Paste the error to your agent.
