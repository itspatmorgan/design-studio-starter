import test from 'node:test';
import assert from 'node:assert/strict';
import mdx from '@mdx-js/rollup';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeMermaid from './rehype-mermaid.js';

test('Mermaid source survives compilation while ordinary code still highlights', async () => {
  const source = 'flowchart LR\n  A["<Feedback> {draft}"] --> B[Review]\n';
  const markdown = '```mermaid\n' + source + '```\n\n```js\nconst value = 1;\n```';
  const plugin = mdx({
    format: 'md', providerImportSource: '@mdx-js/react',
    rehypePlugins: [rehypeMermaid, [rehypePrettyCode, { theme: 'github-light' }]],
  });
  const compiled = (await plugin.transform.call({}, markdown, "/test.md")).code;
  assert.ok(compiled.includes('"mermaid-diagram"'));
  assert.ok(compiled.includes(JSON.stringify(source)));
  assert.ok(compiled.includes('data-rehype-pretty-code-figure'));
  assert.ok(!compiled.includes('language-mermaid'));
});

test('Only Mermaid code fences are replaced, including inside nested content', () => {
  const code = (language) => ({ type: 'element', tagName: 'pre', children: [{ type: 'element', tagName: 'code', properties: { className: [language] }, children: [{ type: 'text', value: 'A --> B\n' }] }] });
  const ordinary = code('language-js');
  const tree = { children: [{ tagName: 'blockquote', children: [code('language-mermaid'), ordinary] }] };
  rehypeMermaid()(tree);
  assert.equal(tree.children[0].children[0].tagName, 'mermaid-diagram');
  assert.equal(tree.children[0].children[0].properties.source, 'A --> B\n');
  assert.equal(tree.children[0].children[1], ordinary);
});
