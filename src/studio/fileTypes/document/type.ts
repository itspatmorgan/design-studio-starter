// A document: written context in a Markdown file (.md), opened as a page in the prototype. Its frontmatter is optional:
//   title, description, toc (true shows an "On this page" list)
import { defineFileType } from '../index.ts';

// "problem-framing.md" → "Problem Framing"
const titleOf = (name: string) => name.replace(/\.md$/, '').split(/[-_]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

export default defineFileType({
  label: 'Document',
  extensions: ['.md'],
  language: 'markdown',
  inHandbook: true,

  template: (name) =>
    `---\ntitle: ${titleOf(name) || 'Untitled'}\n---\n\nThis document is empty. Ask your agent to write it: describe what it's for and who will read it.\n`,

  check: ({ source, frontmatter }) => {
    const problems: string[] = [];
    if (/^---\r?\n/.test(source) && !frontmatter) problems.push('its frontmatter (the block at the top between --- lines) is never closed. End it with a second --- line.');
    if (frontmatter && 'toc' in frontmatter && typeof frontmatter.toc !== 'boolean') problems.push('"toc" in the frontmatter must be true or false.');
    return problems;
  },
});
