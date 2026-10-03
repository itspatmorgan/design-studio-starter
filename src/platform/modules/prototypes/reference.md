# Prototype contract

This reference defines prototype files, metadata, and links. Agent behavior belongs in the [prototype rule](../../../handbook/rules/prototype-workflow.md).

## Files

A prototype lives at `src/prototypes/<contributor>/<id>/` and requires `meta.json`.

Views are `.tsx` or `.jsx` files with a default-exported React component. New views use `.tsx`. Plain `.jsx` is not type-checked.

Folders organize files at any depth. A file or folder starting with `_` is a helper. Helper contents do not become navigation items.

Enabled file types determine other items. Documents and canvases require their respective modules. Assets remain ordinary files.

Two items cannot share a URL, such as `main.tsx` and `main.md` in one folder.

## Metadata

| Field | Contract |
| --- | --- |
| `title` | Required display title. |
| `description` | Optional description. |
| `created` | Optional `YYYY-MM-DD` date. Creation fills it in. |
| `system` | Installed system ID. If omitted, uses `defaultSystem`, or the first installed system by name. |
| `start` | Item path without extension. If omitted, opens the first item. |
| `order` | Relative file and folder paths placed first within their folder, in sequence. |
| `status` | `active` or `archived`. Omission means active. |

Remaining items sort alphabetically, files before folders. Use `order` to reorder, rather than renaming files.

Moving, renaming, or deleting an item must update its `start` and `order` entries. The app performs these updates for its own operations.

Invalid metadata skips the prototype with a local warning and fails the production build. A start item hidden by a disabled file type must be replaced.

Contributor details come from `contributors.json` and `contributors/<key>.json`.

## Links and renaming

`/prototypes/<contributor>/<id>` opens the start item. Appending an item path without extension opens that item.

Nested folders become URL segments. Legacy addresses without `/prototypes` redirect to the canonical address.

Changing the title in the app also renames the prototype folder to its slug. Direct title changes should do the same unless requested otherwise.

Renaming changes shared URLs. Relative document links survive a prototype-folder rename.

The app rewrites links to the prototype's own address in its Markdown and canvas files. Direct file changes must update those links explicitly.

Use TanStack Router's `Link` for view navigation. See its [navigation documentation](https://tanstack.com/router/latest/docs/framework/react/guide/navigation).

## Lofi mode

An opening `/** @lofi */` comment draws that view in grayscale with handwritten type. Its components and behavior remain unchanged.

Remove the comment for normal appearance. A folder named `lofi` has no special behavior. Local wireframes can also use custom components without this mode.

## Validation

Dependency and style requirements are maintained in the prototype rule. Module checks enforce them through `scripts/lib/scope.js` and the style checks.

Whole-prototype archiving is defined in the [archiving rule](../../../handbook/rules/archiving.md).
