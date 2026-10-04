---
referenceOrder: 80
---

# Publishing

Hosting is optional. You can create prototypes locally and collaborate through Git before publishing a site.

Publish when people need a shared viewing URL. The studio maintainer chooses the host, access requirements, and release process.

## What the build provides

`pnpm build` checks the repository and writes a static site to `dist/`. The site includes active prototypes, design-system pages, the Handbook, and the Guide when enabled.

Archived prototypes are excluded from the production build. Individual items cannot be archived. Archive content you want to keep locally without including it in the site.

| Local studio | Published site |
| --- | --- |
| Reads and changes repository files through the dev server. | Serves the files produced by the build. |
| Supports file creation and source editing within the permitted scope. | Does not offer repository file creation or source editing. |
| Shows local changes during development. | Changes when a new build is published. |

Interactive views still run in the browser. The published site does not provide a shared editing backend or an agent service.

## Choose a deployment process

The starter provides a portable build, without a deployment workflow. Pushing to GitHub runs repository checks. It does not publish the site.

Choose a host that can serve the static files in `dist/`. Your team configures how that host receives a build, who can access the site, and when updates are published.

Ask your agent to help configure the chosen host when you are ready. Supply the destination and access requirements. Keep credentials in the host's or CI service's secret settings.

## Make direct links work

The app uses browser-history URLs, such as `/prototypes/alex/feedback-inbox`. Configure the host to serve `index.html` for app paths that do not identify an asset.

Test a direct prototype URL and reload it. Opening the front page alone does not verify routing.

The router also contains guidance for hash-based URLs when a host cannot provide these rewrites. This is a code change, not a studio configuration option.

## Review the published content

Review what the build includes before uploading it. Handbook context, prototype data, and bundled source may contain information you do not want to distribute.

The starter does not provide built-in sign-in or access control. Configure access at the hosting layer when your studio contains private work.

Run the development server in a trusted local environment. Its editing features are not intended to be exposed as a hosted service.
