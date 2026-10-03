// Markdown for the Source view's editor: standard Markdown with GitHub's tables, task lists,
// strikethrough, and bare links. Frontmatter is YAML, and fenced code uses its language when it's
// one we have.
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { yamlFrontmatter, yamlLanguage } from '@codemirror/lang-yaml';

import { mermaidSource } from './mermaidSource.ts';

const diagram = mermaidSource();
const js = javascript({ jsx: true, typescript: true }).language;

// Fenced code in the languages the editor already has.
const codeLanguages = (info: string) => {
  const name = info.trim().split(/\s+/)[0].toLowerCase();
  if (['js', 'jsx', 'javascript', 'ts', 'tsx', 'typescript', 'json'].includes(name)) return js;
  if (name === 'mermaid') return diagram.language;
  if (name === 'yaml' || name === 'yml') return yamlLanguage;
  return null;
};

// The frontmatter at the top is YAML (lang-yaml's own wrapper); the rest is Markdown.
export function markdownSource() {
  return [yamlFrontmatter({ content: markdown({ base: markdownLanguage, codeLanguages }) }), diagram.support];
}
