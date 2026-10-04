import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownPath } from '../../src/platform/app/docs/referenceLinks.ts';
import globs from '../build/vite-globs-plugin.js';
import { ENABLED_MODULES } from './modules.js';
import readme from '../build/remark-readme-guide.js';

test('repository links resolve from SystemContent and between references', () => {
  const resolve = (href, base) => markdownPath(new URL(href, `http://doc${base}/`).pathname);
  assert.equal(resolve('../../../../modules/systems/README.md', '/systems/studio/rules'), '/documentation/reference/modules/systems/README.md');
  assert.equal(resolve('reference.md', '/documentation/reference/modules/systems'), '/documentation/reference/modules/systems/reference.md');
  assert.equal(resolve('../../../../systems/studio/rules/systems.md', '/documentation/reference/modules/systems'), '/systems/studio/rules/systems');
  assert.equal(resolve('./main.tsx', '/prototypes/patrick/example'), '/prototypes/patrick/example/main.tsx');
  assert.equal(markdownPath('/documentation/guide/systemContent'), '/documentation/guide/systemContent');
});

test('reference glob is limited to platform Markdown and enabled modules', () => {
  const result = globs().transform("const pages = import.meta.glob(['/__studio_references__/*'])", '/src/platform/app/docs/loadReference.ts');
  assert.ok(result);
  const patterns = JSON.parse(result.code.slice('const pages = import.meta.glob('.length, -1));
  assert.deepEqual(patterns, ['/platform/core/*.md', '/modules/README.md', ...ENABLED_MODULES.map((m) => `/modules/${m.id}/*.md`)]);
});

test('full README rendering retains developer content without repeating its title', () => {
  const heading = (depth, value) => ({ type: 'heading', depth, children: [{ type: 'text', value }] });
  const tree = { children: [heading(1, 'SystemContent'), heading(2, 'For developers'), { type: 'paragraph', children: [{ type: 'text', value: 'Contract' }] }] };
  const full = structuredClone(tree);
  readme({ full: true })(full, { basename: 'README.md' });
  assert.deepEqual(full.children, tree.children.slice(1));
  readme()(tree, { basename: 'README.md' });
  assert.deepEqual(tree.children, []);
});

test('repository Context links resolve to the Context reader', () => {
  assert.equal(markdownPath('/systems/studio/context/personas.md'), '/systems/studio/context/personas');
  assert.equal(markdownPath('/systems/studio/rules/documentation-standards'), '/systems/studio/rules/documentation-standards');
});
