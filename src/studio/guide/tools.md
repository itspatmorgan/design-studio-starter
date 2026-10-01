---
title: "Tools"
description: "Publish a prototype as a small app the whole team can use."
section: "Core concepts"
order: 17
toc: true
---

A tool is a small app that makes something: a thumbnail, a gradient, a graphic with the right sizes. People use it to get an asset, not to look at a design. It's still a prototype. What changes is that it belongs to the team, has people who keep it working, and opens like an app.

## From prototype to tool

A tool starts as an ordinary prototype in your folder, so it looks and works like one while you build it. Any prototype can become a tool when it's ready.

When it's ready, open the prototype's **…** menu and choose **Publish as tool**. Or open the **Tools** page and choose **Publish a prototype** to pick from your list.

Publishing moves the folder from `src/prototypes/<you>/<name>/` to `src/tools/<name>/` and adds you as a maintainer. Its address changes from `/<you>/<name>` to `/tools/<name>`. Links inside the tool's own canvases and documents are updated for you. If other prototypes link to the old address, the app says which files, and those need fixing by hand.

**Unpublish**, in the same menu, moves it back into your folder.

## How a tool opens

On the deployed site, a tool fills the window. There's no rail or file navigation, only the tool's start view. Choose that view with **Set as start**, like any prototype. If the tool has other screens, they link to each other and open full-window too.

While you run the app locally, the usual prototype navigation stays, so you can edit it. Documents and canvases beside a tool are for you and your agent, such as a guideline for how it should behave. People using the tool never see them.

## Maintainers

A tool isn't anyone's folder, so `meta.json` says who may change it:

```json
{
  "title": "Gradient Studio",
  "description": "Author and export animated brand gradients.",
  "maintainers": ["patrick"]
}
```

`maintainers` is a list of `contributors.json` keys. Publishing writes yours. Anyone can use the tool and read its files, but only a maintainer can change it, in the app or in a pull request. Add a name to hand over or share the work. [Scopes](/guide/scopes) covers the check.

Whether changes to a tool are reviewed is up to your team. If you want that, add a `CODEOWNERS` line for `src/tools/<name>/`.

## Building a good one

- Design the start view as an app: it owns the whole window, so give it its own header and controls.
- What it makes should be a download or a copy to the clipboard, not a file saved into the repo.
- A tool is archived, built, and deployed like a prototype. [Archiving](/guide/prototypes#archiving) works the same way.
