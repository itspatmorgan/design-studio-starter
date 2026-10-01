# Guide module

The Guide: pages about Design Studio itself, at `/guide`. Optional: turn it off in `studio.config.ts` or delete this folder.

- `module.ts`: who it is and its section.
- `app.tsx`: its rail button and routes.
- `pages/*.md`: the Guide's pages, in the order their `order` frontmatter gives. Add a page by adding a file.
- `GuideLayout.tsx`, `loadGuide.ts`: how a page is shown and loaded.
