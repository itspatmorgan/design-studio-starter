---
title: Markdown sample
description: "Every element, to check the Source view's highlighting."
toc: true
---

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Setext heading 1
================

Setext heading 2
----------------

A paragraph with **bold**, *italic*, ***both***, __bold__, _italic_, ~~strikethrough~~, and `inline code`. It has a [link](https://example.com "A title"), a [reference link][ref], a bare https://example.com URL, an ![image](./hero.webp "Alt title"), an escaped \* star, and an &amp; entity.
A hard break follows this line.  
And this is the next line.

[ref]: https://example.com/reference "Reference"

- Bullet one
- Bullet two
  - Nested bullet
    - Deeper bullet
* Star bullet
+ Plus bullet

1. Ordered one
2. Ordered two
   1. Nested ordered
10. Ordered ten

- [ ] Open task
- [x] Done task

> A blockquote with **bold** and `code`.
>
> > A nested blockquote.

---

***

```ts
// A TypeScript block
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

```tsx
const el = <button type="button">Click</button>;
```

```json
{ "name": "sample", "count": 3, "ok": true, "none": null }
```

```yaml
title: A YAML block
tags: [a, b]
```

```bash
pnpm dev
```

```
A block with no language.
```

| Left | Center | Right |
| :--- | :----: | ----: |
| a    |   b    |     c |
| `d`  | **e**  | [f](#) |

Braces { like this } and <angle brackets> are plain text here.

Footnote reference[^1].

[^1]: The footnote text.
