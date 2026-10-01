// What studio.config.ts may say (config.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configProblems, isEnabled } from './config.ts';

const modules = [{ id: 'guide', optional: true }, { id: 'tools' }];

test('a name alone is a complete config', () => {
  assert.deepEqual(configProblems({ name: 'Acme Studio' }, modules), []);
  assert.deepEqual(configProblems({ name: 'Acme Studio', modules: {} }, modules), []);
});

test('the name is required', () => {
  assert.match(configProblems({ name: ' ' }, modules)[0], /add a name/);
  assert.match(configProblems({}, modules)[0], /add a name/);
  assert.match(configProblems(undefined, modules)[0], /must export a config/);
});

test('a module that can be turned off may be', () => {
  assert.deepEqual(configProblems({ name: 'A', modules: { guide: false } }, modules), []);
  assert.deepEqual(configProblems({ name: 'A', modules: { guide: true, tools: true } }, modules), []);
});

test('a module other parts still use can not be turned off yet', () => {
  assert.match(configProblems({ name: 'A', modules: { tools: false } }, modules)[0], /tools module can't be turned off yet/);
});

test('an unknown module or a value that is not true or false is named', () => {
  assert.match(configProblems({ name: 'A', modules: { nope: false } }, modules)[0], /"nope".*Installed: guide, tools/);
  assert.match(configProblems({ name: 'A', modules: { guide: 'no' } }, modules)[0], /modules\.guide should be true or false/);
  assert.match(configProblems({ name: 'A', modules: ['guide'] }, modules)[0], /should list module ids/);
});

test('every module is on unless the config turns it off', () => {
  assert.equal(isEnabled({ name: 'A' }, 'guide'), true);
  assert.equal(isEnabled({ name: 'A', modules: { guide: false } }, 'guide'), false);
  assert.equal(isEnabled({ name: 'A', modules: { guide: false } }, 'tools'), true);
});
