# Guide module

The Guide: pages about Design Studio itself, at `/guide`. Optional: turn it off in `studio.config.ts` or delete this folder.

- `module.ts`: who it is and its section.
- `app.tsx`: its rail button and routes.
- `pages/*.md`: the Guide's own pages, about the app as a whole, in the order their `order` frontmatter gives. Add a page by adding a file.
- A page for a module or file type is that folder's `README.md`, when it opens with Guide frontmatter: the Guide shows it down to a `## For developers` heading (`scripts/lib/guide-pages.js` finds them, `scripts/build/remark-readme-guide.js` trims them). Removing the folder removes the page.
- `GuideLayout.tsx`, `loadGuide.ts`: how a page is shown and loaded.
