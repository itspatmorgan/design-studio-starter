// The checks on a module's declaration (index.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compatible, listProblems, moduleProblems, sectionKeys, type ModuleSpec } from './index.ts';

const tools: ModuleSpec = { id: 'tools', label: 'Tools', version: '0.1.0', section: { key: 'tools', folder: 'src/tools' } };

test('a well formed module has no problems', () => {
  assert.deepEqual(moduleProblems(tools, 'tools'), []);
  assert.deepEqual(moduleProblems({ id: 'x', label: 'X', version: '1.2.3' }, 'x'), []);
});

test('the id has to be the folder name', () => {
  assert.match(moduleProblems({ ...tools, id: 'other' }, 'tools')[0], /must match the folder name, "tools"/);
});

test('a missing label or a malformed version is named', () => {
  assert.match(moduleProblems({ ...tools, label: ' ' }, 'tools')[0], /add a label/);
  assert.match(moduleProblems({ ...tools, version: '1' }, 'tools')[0], /version should look like 0\.1\.0/);
});

test('a section folder can not climb out of the repo', () => {
  assert.match(moduleProblems({ ...tools, section: { key: 'tools', folder: '../tools' } }, 'tools')[0], /inside the repo/);
  assert.match(moduleProblems({ ...tools, section: { key: 'tools', folder: '/etc' } }, 'tools')[0], /inside the repo/);
  assert.match(moduleProblems({ ...tools, section: { key: 'Tools!', folder: 'src/tools' } }, 'tools')[0], /section\.key/);
});

test('anything that is not an object is not a module', () => {
  assert.match(moduleProblems(undefined, 'tools')[0], /must export a module/);
  assert.match(moduleProblems('tools', 'tools')[0], /must export a module/);
});

test('two modules can not share a section key or folder', () => {
  const other: ModuleSpec = { id: 'other', label: 'Other', version: '0.1.0', section: { key: 'tools', folder: 'src/tools' } };
  const problems = listProblems([tools, other]);
  assert.equal(problems.length, 2);
  assert.match(problems[0], /both use the section key "tools"/);
  assert.match(problems[1], /both keep their files in src\/tools/);
});

test('section keys skip modules with no section', () => {
  assert.deepEqual(sectionKeys([tools, { id: 'x', label: 'X', version: '0.1.0' }]), ['tools']);
});

test('a policy must be one a section can have', () => {
  assert.deepEqual(moduleProblems({ ...tools, section: { key: 'tools', folder: 'src/tools', policy: 'maintainers' } }, 'tools'), []);
  assert.match(moduleProblems({ ...tools, section: { key: 'tools', folder: 'src/tools', policy: 'owner' as 'open' } }, 'tools')[0], /section\.policy/);
});

test('items must be a known kind, in a folder directly under src', () => {
  assert.deepEqual(moduleProblems({ ...tools, section: { key: 'tools', folder: 'src/tools', items: 'prototypes' } }, 'tools'), []);
  assert.match(moduleProblems({ ...tools, section: { key: 'tools', folder: 'src/tools', items: 'files' as 'prototypes' } }, 'tools')[0], /section\.items/);
  assert.match(moduleProblems({ ...tools, section: { key: 'tools', folder: 'src/platform/tools', items: 'prototypes' } }, 'tools')[0], /directly under src/);
});

test('a module may say the oldest platform it works with', () => {
  assert.deepEqual(moduleProblems({ ...tools, requires: '0.1.0' }, 'tools'), []);
  assert.match(moduleProblems({ ...tools, requires: '^0.1' }, 'tools')[0], /requires should look like 0\.1\.0/);
});

test('a module needing a newer platform than this one is not compatible', () => {
  assert.equal(compatible({}, '0.1.0'), true);
  assert.equal(compatible({ requires: '0.1.0' }, '0.1.0'), true);
  assert.equal(compatible({ requires: '0.1.0' }, '0.2.3'), true);
  assert.equal(compatible({ requires: '0.2.0' }, '0.1.9'), false);
  assert.equal(compatible({ requires: '1.0.0' }, '0.9.9'), false);
  assert.equal(compatible({ requires: '0.10.0' }, '0.9.0'), false);
});
