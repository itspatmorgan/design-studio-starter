import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configProblems, isEnabled, type StudioConfig } from './config.ts';

const modules = [{ id: 'documentation', optional: true }, { id: 'prototypes', optional: false }];
const config: StudioConfig = { name: 'Studio', usage: 'team', modules: { documentation: true, prototypes: true }, systems: ['platform', 'product'], defaultSystem: 'product' };
const problems = (changes: Record<string, unknown>) => configProblems({ ...config, ...changes }, modules, ['product']).join('\n');

test('an explicit configuration is complete', () => {
  assert.deepEqual(configProblems(config, modules, ['product']), []);
  assert.deepEqual(configProblems({ ...config, usage: 'personal', modules: { ...config.modules, documentation: false } }, modules, ['product']), []);
});

test('identity and optional tagline are validated', () => {
  assert.match(problems({ name: ' ' }), /add a name/);
  assert.match(problems({ usage: undefined }), /usage should/);
  assert.match(problems({ usage: 'other' }), /usage should/);
  assert.match(problems({ tagline: 'x'.repeat(141) }), /tagline/);
  assert.match(problems({ tagline: 42 }), /tagline/);
  assert.deepEqual(configProblems({ ...config, tagline: 'Our work' }, modules, ['product']), []);
  assert.match(configProblems(undefined, modules)[0], /must export/);
});

test('every installed module needs an explicit boolean', () => {
  assert.match(problems({ modules: undefined }), /declare every installed module/);
  assert.match(problems({ modules: { prototypes: true } }), /declare modules.documentation/);
  assert.match(problems({ modules: { ...config.modules, nope: true } }), /no module has that id/);
  assert.match(problems({ modules: { ...config.modules, documentation: 'yes' } }), /true or false/);
  assert.match(problems({ modules: [] }), /should list module ids/);
  assert.match(problems({ modules: { ...config.modules, prototypes: false } }), /can't be turned off/);
});

test('omission never activates a module', () => {
  assert.equal(isEnabled({}, 'documentation'), false);
  assert.equal(isEnabled({ modules: {} }, 'documentation'), false);
  assert.equal(isEnabled(config, 'documentation'), true);
  assert.equal(isEnabled({ modules: { documentation: false } }, 'documentation'), false);
});

test('systems and default system are registered explicitly', () => {
  assert.match(problems({ systems: undefined }), /explicitly list/);
  assert.match(problems({ systems: ['product'] }), /must include platform/);
  assert.match(problems({ systems: ['platform'] }), /register installed system "product"/);
  assert.match(problems({ systems: ['platform', 'product', 'brand'] }), /not installed/);
  assert.match(problems({ systems: ['platform', 'product', 'product'] }), /unique/);
  assert.match(problems({ defaultSystem: undefined }), /declare defaultSystem/);
  assert.match(problems({ defaultSystem: 'platform' }), /no system has that id/);
  assert.match(problems({ defaultSystem: 'brand' }), /no system has that id/);
});
