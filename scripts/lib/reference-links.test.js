import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownPath } from '../../src/platform/app/docs/referenceLinks.ts';
import globs from '../build/vite-globs-plugin.js';
import { ENABLED_MODULES } from './modules.js';
import titleFromHeading from '../build/remark-title-from-heading.js';

test('repository links resolve from SystemContent and between references', () => {
  const resolve = (href, base) => markdownPath(new URL(href, `http://doc${base}/`).pathname);
  assert.equal(resolve('../../../../modules/systems/README.md', '/systems/studio/context'), '/documentation/reference/modules/systems/README.md');
  assert.equal(resolve('README.md', '/documentation/reference/modules/systems'), '/documentation/reference/modules/systems/README.md');
  assert.equal(resolve('../../../../systems/studio/context/systems.md', '/documentation/reference/modules/systems'), '/systems/studio/context/systems');
  assert.equal(resolve('./main.tsx', '/prototypes/patrick/example'), '/prototypes/patrick/example/main.tsx');
  assert.equal(markdownPath('/documentation/guide/systemContent'), '/documentation/guide/systemContent');
  assert.equal(markdownPath('/modules/documentation/pages/prototypes.md'), '/documentation/guide/prototypes');
  assert.equal(markdownPath('/modules/documentation/pages/index.md'), '/documentation/guide');
});

test('reference glob is limited to platform Markdown and enabled modules', () => {
  const result = globs().transform("const pages = import.meta.glob(['/__studio_references__/*'])", '/src/platform/app/docs/loadReference.ts');
  assert.ok(result);
  const patterns = JSON.parse(result.code.slice('const pages = import.meta.glob('.length, -1));
  assert.deepEqual(patterns, ['/platform/core/*.md', '/modules/README.md', ...ENABLED_MODULES.map((m) => `/modules/${m.id}/*.md`)]);
});

test('contracts render every section and extract only the opening title', () => {
  const heading = (depth, value) => ({ type: 'heading', depth, children: [{ type: 'text', value }] });
  const sections = [heading(2, 'For developers'), { type: 'paragraph', children: [{ type: 'text', value: 'Contract' }] }];
  const tree = { children: [heading(1, 'System contract'), ...sections] };
  titleFromHeading()(tree, { basename: 'README.md' });
  assert.equal(tree.children[0].type, 'yaml');
  assert.deepEqual(tree.children.slice(1), sections, 'the reader must not truncate contract sections');
});

test('repository Context links resolve to the Context reader', () => {
  assert.equal(markdownPath('/platform/context/personas.md'), '/knowledge/platform.core/context/personas');
  assert.equal(markdownPath('/systems/studio/context/documentation-standards'), '/systems/studio/context/documentation-standards');
});

test('saved links follow guidance and contract migrations', () => {
  assert.equal(markdownPath('/systems/studio/rules/prototype-workflow'), '/knowledge/module.prototypes/skills/build-prototype/SKILL');
  assert.equal(markdownPath('/systems/studio/context/principles.md'), '/knowledge/platform.core/context/principles');
  assert.equal(markdownPath('/systems/studio/skills/setup-design-system/SKILL.md'), '/knowledge/module.systems/skills/setup-design-system/SKILL');
  assert.equal(markdownPath('/documentation/reference/modules/systems/reference.md'), '/documentation/reference/modules/systems/README.md');
});
