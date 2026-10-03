// The frontmatter every Markdown page shares: Guide pages (src/platform/modules/documentation/pages/) and prototype documents
// (src/platform/modules/document/). Guide pages add order and section, read by the build.
export type DocFrontmatter = { title?: string; description?: string; toc?: boolean };
