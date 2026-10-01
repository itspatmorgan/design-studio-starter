// Who maintains a tool (tools.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canMaintain, parseMaintainers } from './tools.ts';

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

test('only a listed maintainer may change a tool', () => {
  assert.equal(canMaintain(['patrick', 'abigail'], 'abigail'), true);
  assert.equal(canMaintain(['patrick'], 'abigail'), false);
  assert.equal(canMaintain(['patrick'], null), false);
  assert.equal(canMaintain(undefined, 'patrick'), false);
});
