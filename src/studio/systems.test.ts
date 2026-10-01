// What a design system's system.ts may say (systems.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { systemProblems, type SystemSpec } from './systems.ts';

const product: SystemSpec = { label: 'Product', themeClass: 'product-theme', docs: 'warn', origin: 'shadcn' };

test('a well formed system has no problems', () => {
  assert.deepEqual(systemProblems(product, 'product'), []);
  assert.deepEqual(systemProblems({ label: 'Brand', themeClass: 'brand-theme' }, 'brand'), []);
});

test('a label and a theme class are required', () => {
  assert.match(systemProblems({ ...product, label: ' ' }, 'product')[0], /add a label/);
  assert.match(systemProblems({ ...product, themeClass: 'Product Theme' }, 'product')[0], /themeClass should be a CSS class name like "product-theme"/);
});

test('docs and origin take only the values the build understands', () => {
  assert.match(systemProblems({ ...product, docs: 'loud' as 'warn' }, 'product')[0], /docs should be/);
  assert.match(systemProblems({ ...product, origin: 'radix' as 'shadcn' }, 'product')[0], /origin should be 'shadcn'/);
});

test('the folder is the id: lowercase, and not the app\'s own', () => {
  assert.match(systemProblems(product, 'Product')[0], /lowercase letters/);
  assert.match(systemProblems(product, 'studio')[0], /app's own system/);
});

test('anything that is not an object is not a system', () => {
  assert.match(systemProblems(undefined, 'product')[0], /must export a system/);
});
