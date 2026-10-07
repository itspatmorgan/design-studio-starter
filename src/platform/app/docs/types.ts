// The frontmatter every Markdown page shares: Manual pages (src/modules/documentation/pages/) and prototype documents
// (src/modules/document/). Manual pages add order and section, read by the build.
export type DocFrontmatter = { title?: string; description?: string; toc?: boolean };
