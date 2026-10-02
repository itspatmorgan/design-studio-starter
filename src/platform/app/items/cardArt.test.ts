// The gradient on a card (cardArt.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardArt, cardHues, monogram } from './cardArt.ts';

test('the same item always gets the same colours', () => {
  assert.deepEqual(cardHues('quote-card'), cardHues('quote-card'));
  assert.deepEqual(cardArt('quote-card'), cardArt('quote-card'));
});

test('different items get different colours, and the hues are valid', () => {
  const ids = ['quote-card', 'gradient-studio', 'og-image-generator', 'thumbnail-generator'];
  assert.equal(new Set(ids.map((id) => cardHues(id).join())).size, ids.length);
  for (const id of ids) for (const hue of cardHues(id)) assert.ok(Number.isInteger(hue) && hue >= 0 && hue < 360);
});

test('a tile is marked with the first letter of the title', () => {
  assert.equal(monogram('quote card'), 'Q');
  assert.equal(monogram('  \u201cHello\u201d'), 'H');
  assert.equal(monogram('42 things'), '4');
  assert.equal(monogram('***'), '·');
});
