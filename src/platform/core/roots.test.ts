// Where items open and how an address is read back (roots.ts). Run with `pnpm test`.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addressOf, isSectionKey, parseAddress, rootOf, setSections } from './roots.ts';

setSections(['examples']);

test('a prototype opens under /prototypes, a section item under its section', () => {
  assert.equal(addressOf('patrick', 'hello-world'), '/prototypes/patrick/hello-world');
  assert.equal(addressOf('examples', 'sample'), '/examples/sample');
  assert.equal(addressOf('handbook', 'rules'), '/handbook/rules');
  assert.equal(isSectionKey('patrick'), false);
  assert.equal(isSectionKey('systems'), true);
});

test('an address reads back in the new and the older form', () => {
  assert.deepEqual(parseAddress('/prototypes/patrick/hello-world/lofi/main'), { contributor: 'patrick', id: 'hello-world', rest: ['lofi', 'main'] });
  assert.deepEqual(parseAddress('/patrick/hello-world/lofi/main'), { contributor: 'patrick', id: 'hello-world', rest: ['lofi', 'main'] });
  assert.deepEqual(parseAddress('/examples/sample'), { contributor: 'examples', id: 'sample', rest: [] });
  assert.equal(parseAddress('/prototypes'), null);
  assert.equal(parseAddress('/prototypes/patrick'), null);
});

test('files are still found by contributor and id', () => {
  assert.equal(rootOf('patrick', 'hello-world'), 'prototypes/patrick/hello-world');
  assert.equal(rootOf('examples', 'sample'), 'examples/sample');
});

test('Handbook Context addresses resolve to the docs folder', () => {
  assert.equal(addressOf('handbook', 'docs'), '/handbook/context');
  assert.deepEqual(parseAddress('/handbook/context/personas'), { contributor: 'handbook', id: 'docs', rest: ['personas'] });
  assert.equal(rootOf('handbook', 'docs'), 'handbook/docs');
});
