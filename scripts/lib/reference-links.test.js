import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownPath } from '../../src/platform/app/docs/referenceLinks.ts';
import globs from '../build/vite-globs-plugin.js';
import { ENABLED_MODULES } from './modules.js';
import readme from '../build/remark-readme-guide.js';

test('repository links resolve from Handbook and between references', () => {
  const resolve = (href, base) => markdownPath(new URL(href, `http://doc${base}/`).pathname);
  assert.equal(resolve('../../platform/modules/handbook/README.md', '/handbook/rules'), '/reference/platform/modules/handbook/README.md');
  assert.equal(resolve('reference.md', '/reference/platform/modules/systems'), '/reference/platform/modules/systems/reference.md');
  assert.equal(resolve('../../../handbook/rules/systems.md', '/reference/platform/modules/systems'), '/handbook/rules/systems.md');
  assert.equal(resolve('./main.tsx', '/prototypes/patrick/example'), '/prototypes/patrick/example/main.tsx');
  assert.equal(markdownPath('/guide/handbook'), '/guide/handbook');
});

test('reference glob is limited to platform Markdown and enabled modules', () => {
  const result = globs().transform("const pages = import.meta.glob(['/__studio_references__/*'])", '/src/platform/app/docs/loadReference.ts');
  assert.ok(result);
  const patterns = JSON.parse(result.code.slice('const pages = import.meta.glob('.length, -1));
  assert.deepEqual(patterns, ['/platform/core/*.md', '/platform/modules/README.md', ...ENABLED_MODULES.map((m) => `/platform/modules/${m.id}/*.md`)]);
});

test('full README rendering retains developer content without repeating its title', () => {
  const heading = (depth, value) => ({ type: 'heading', depth, children: [{ type: 'text', value }] });
  const tree = { children: [heading(1, 'Handbook'), heading(2, 'For developers'), { type: 'paragraph', children: [{ type: 'text', value: 'Contract' }] }] };
  const full = structuredClone(tree);
  readme({ full: true })(full, { basename: 'README.md' });
  assert.deepEqual(full.children, tree.children.slice(1));
  readme()(tree, { basename: 'README.md' });
  assert.deepEqual(tree.children, []);
});

test('Handbook reference links stay in Handbook and resolve back to its instructions', () => {
  const resolve = (href, base) => markdownPath(new URL(href, `http://doc${base}/`).pathname);
  assert.equal(resolve('reference.md', '/handbook/platform/platform/modules/systems'), '/handbook/platform/platform/modules/systems/reference.md');
  assert.equal(resolve('../../../handbook/rules/systems.md', '/handbook/platform/platform/modules/systems'), '/handbook/rules/systems.md');
  assert.equal(resolve('../../core/fileTypes.md', '/handbook/platform/platform/modules/systems'), '/handbook/platform/platform/core/fileTypes.md');
});
