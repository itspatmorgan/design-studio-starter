// Who may change what (permissions.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canChange, canMaintain, canOwn, parseMaintainers, policyFor, whyNot } from './permissions.ts';
import type { ModuleSpec } from './modules/index.ts';

const modules: ModuleSpec[] = [
  { id: 'tools', label: 'Tools', version: '0.1.0', section: { key: 'tools', folder: 'src/tools', items: 'prototypes', policy: 'maintainers' } },
  { id: 'handbook', label: 'Handbook', version: '0.1.0', section: { key: 'handbook', folder: 'src/handbook', items: 'handbook', policy: 'open' } },
  { id: 'guide', label: 'Guide', version: '0.1.0', section: { key: 'guide', folder: 'src/platform/modules/guide/pages' } },
  { id: 'extra', label: 'Extra', version: '0.1.0' },
];

test('maintainers are a list of at least one contributor key', () => {
  assert.deepEqual(parseMaintainers(['patrick']), ['patrick']);
  assert.deepEqual(parseMaintainers(['patrick', 'abigail', 'patrick']), ['patrick', 'abigail']);
  assert.equal(parseMaintainers([]), null);
  assert.equal(parseMaintainers('patrick'), null);
  assert.equal(parseMaintainers(undefined), null);
  assert.equal(parseMaintainers([3]), null);
});

test('a key that could climb out of a folder is not a maintainer', () => {
  assert.equal(parseMaintainers(['../patrick']), null);
  assert.equal(parseMaintainers(['a/b']), null);
  assert.equal(parseMaintainers(['']), null);
});

test('only a listed maintainer may maintain', () => {
  assert.equal(canMaintain(['patrick', 'abigail'], 'abigail'), true);
  assert.equal(canMaintain(['patrick'], 'abigail'), false);
  assert.equal(canMaintain(['patrick'], null), false);
  assert.equal(canMaintain(undefined, 'patrick'), false);
});

test('a key no module claims is a contributor, and a section says its own policy', () => {
  assert.equal(policyFor('patrick', modules), 'owner');
  assert.equal(policyFor('tools', modules), 'maintainers');
  assert.equal(policyFor('handbook', modules), 'open');
  assert.equal(policyFor('guide', modules), 'none');
});

test('you own your own prototypes and nobody else\'s', () => {
  assert.equal(canOwn('owner', { me: 'patrick', key: 'patrick' }), true);
  assert.equal(canOwn('owner', { me: 'abigail', key: 'patrick' }), false);
  assert.equal(canOwn('owner', { me: null, key: 'patrick' }), false);
});

test('a tool is owned by its maintainers, whoever started it', () => {
  assert.equal(canOwn('maintainers', { me: 'abigail', key: 'tools', maintainers: ['patrick', 'abigail'] }), true);
  assert.equal(canOwn('maintainers', { me: 'sam', key: 'tools', maintainers: ['patrick'] }), false);
  assert.equal(canOwn('maintainers', { me: 'patrick', key: 'tools' }), false);
});

test('open files can be changed by anyone, but nobody owns them', () => {
  assert.equal(canChange('open', { me: null, key: 'handbook' }), true);
  assert.equal(canOwn('open', { me: 'patrick', key: 'handbook' }), false);
});

test('nobody changes a section with no policy', () => {
  assert.equal(canChange('none', { me: 'patrick', key: 'guide' }), false);
});

test('changing needs owning, except where files are open', () => {
  assert.equal(canChange('owner', { me: 'patrick', key: 'patrick' }), true);
  assert.equal(canChange('owner', { me: 'abigail', key: 'patrick' }), false);
  assert.equal(canChange('maintainers', { me: 'sam', key: 'tools', maintainers: ['patrick'] }), false);
});

test('the reason says what to do', () => {
  assert.match(whyNot('owner', null), /not set up/);
  assert.match(whyNot('maintainers', null), /not set up/);
  assert.match(whyNot('owner', 'abigail'), /belongs to someone else/);
  assert.match(whyNot('maintainers', 'abigail'), /maintainers/);
  assert.match(whyNot('none', 'abigail'), /can't be changed/);
});
