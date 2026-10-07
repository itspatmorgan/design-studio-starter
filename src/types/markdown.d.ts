// Manual pages and documents: .md files export their content and their frontmatter (remark-mdx-frontmatter).
declare module '*.md' {
  import type { MDXContent } from 'mdx/types';
  const MDXComponent: MDXContent;
  export default MDXComponent;
  export const frontmatter: { title?: string; description?: string; toc?: boolean };
}
