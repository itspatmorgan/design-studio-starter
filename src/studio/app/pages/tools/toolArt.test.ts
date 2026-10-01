// The gradient on a tool's card (toolArt.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toolArt, toolHues } from './toolArt.ts';

test('the same tool always gets the same colours', () => {
  assert.deepEqual(toolHues('quote-card'), toolHues('quote-card'));
  assert.deepEqual(toolArt('quote-card'), toolArt('quote-card'));
});

test('different tools get different colours, and the hues are valid', () => {
  const ids = ['quote-card', 'gradient-studio', 'og-image-generator', 'thumbnail-generator'];
  assert.equal(new Set(ids.map((id) => toolHues(id).join())).size, ids.length);
  for (const id of ids) for (const hue of toolHues(id)) assert.ok(Number.isInteger(hue) && hue >= 0 && hue < 360);
});
