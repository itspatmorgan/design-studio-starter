// The quote card's text rules (text.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanQuote, fileName } from './text.ts';

const spec = (customer = '') => ({ customer });

test('a quote loses its own quotation marks and stray spacing', () => {
  assert.equal(cleanQuote('  “It   works.”  '), 'It works.');
  assert.equal(cleanQuote('"Line one\n\nline two"'), 'Line one line two');
});

test('a very long quote is cut to a length a card can hold', () => {
  assert.equal(cleanQuote('a'.repeat(5000)).length, 600);
});

test('the file is named for the customer, safely', () => {
  assert.equal(fileName(spec('Maya Chen')), 'quote-card-maya-chen.png');
  assert.equal(fileName(spec('../../etc/passwd')), 'quote-card-etc-passwd.png');
  assert.equal(fileName(spec()), 'quote-card.png');
});
