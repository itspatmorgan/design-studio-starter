// What a design system's system.ts may say (systems.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { systemProblems, systemColorMode, type SystemSpec } from './spec.ts';

const product: SystemSpec = { role: 'prototype', colorModes: ['light', 'dark'], label: 'Product', themeClass: 'product-theme', docs: 'warn', origin: 'shadcn' };

test('a well formed system has no problems', () => {
  assert.deepEqual(systemProblems(product, 'product'), []);
  assert.deepEqual(systemProblems({ ...product, label: 'Brand', themeClass: 'brand-theme', origin: null }, 'brand'), []);
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
  assert.match(systemProblems(product, 'platform')[0], /app's own system/);
});

test('anything that is not an object is not a system', () => {
  assert.match(systemProblems(undefined, 'product')[0], /must export a system/);
});


test('systems declare supported modes and safely resolve a global mode', () => {
  assert.equal(systemColorMode(product.colorModes, 'dark'), 'dark');
  assert.equal(systemColorMode(product.colorModes, 'light'), 'light');
  assert.equal(systemColorMode(['light'], 'dark'), 'light');
  assert.equal(systemColorMode(['dark'], 'light'), 'dark');
  assert.equal(systemColorMode(['light', 'dark'], 'dark'), 'dark');
  assert.equal(systemColorMode(['light', 'dark'], 'light'), 'light');
  for (const colorModes of [[], ['light', 'light'], ['automatic'], 'light']) {
    assert.match(systemProblems({ ...product, colorModes }, 'product').join(' '), /colorModes must/);
  }
  assert.deepEqual(systemProblems({ ...product, colorModes: ['dark'] }, 'product'), []);
});

test('Platform is a declared system role reserved for Studio', () => {
  assert.deepEqual(systemProblems({ ...product, role: 'platform', themeClass: 'platform-theme' }, 'platform'), []);
  assert.match(systemProblems({ ...product, role: 'platform' }, 'product').join(' '), /only the built-in platform/);
});

test('system policy fields cannot be inferred from omission', () => {
  for (const field of ['role', 'colorModes', 'docs', 'origin']) {
    const spec = { ...product };
    delete (spec as Record<string, unknown>)[field];
    assert.ok(systemProblems(spec, 'product').some((problem) => problem.includes(field)), field);
  }
});
