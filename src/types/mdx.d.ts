// Guide pages: .mdx files export their content and their frontmatter (remark-mdx-frontmatter).
declare module '*.mdx' {
  import type { MDXContent } from 'mdx/types';
  const MDXComponent: MDXContent;
  export default MDXComponent;
  export const frontmatter: { title?: string; description?: string; toc?: boolean };
}
