// What a tool says about links (staleLinks.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { staleLinksMessage } from './staleLinks.ts';

test('the message about stale links names one file, or counts several', () => {
  assert.equal(staleLinksMessage(['a.md']), 'Update the link to the old address in a.md.');
  assert.equal(staleLinksMessage(['a.md', 'b.md']), '2 files still link to the old address: a.md, b.md.');
  assert.equal(staleLinksMessage(['a.md', 'b.md', 'c.md']), '3 files still link to the old address: a.md, b.md, and more.');
});
