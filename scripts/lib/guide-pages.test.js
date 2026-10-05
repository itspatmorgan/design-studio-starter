import test from 'node:test';
import assert from 'node:assert/strict';
import { guideChapterEnabled } from './guide-pages.js';

test('Guide availability follows capability registration while malformed metadata remains repairable', () => {
  assert.equal(guideChapterEnabled({module:'canvas'}, ['canvas']), true);
  assert.equal(guideChapterEnabled({module:'canvas'}, ['document']), false);
  assert.equal(guideChapterEnabled({module:'removed-capability'}, []), false);
  assert.equal(guideChapterEnabled({title:'Introduction'}, []), true);
  assert.equal(guideChapterEnabled({module:42}, []), true, 'invalid metadata must reach validation');
});
