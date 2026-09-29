// The frontmatter every Markdown page shares: Guide pages (src/guide/) and prototype documents
// (src/fileTypes/document/). Guide pages add order and section, read by the build.
export type DocFrontmatter = { title?: string; description?: string; toc?: boolean };
