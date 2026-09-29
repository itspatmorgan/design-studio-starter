// The frontmatter every Markdown page shares: Guide pages (src/studio/guide/) and prototype documents
// (src/studio/fileTypes/document/). Guide pages add order and section, read by the build.
export type DocFrontmatter = { title?: string; description?: string; toc?: boolean };
