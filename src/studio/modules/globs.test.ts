// The patterns each file type's loader lists its files with (globs.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FILE_TYPES } from '../../../scripts/lib/file-types.js';
import guide from './guide/module.ts';
import handbook from './handbook/module.ts';
import systems from './systems/module.ts';
import tools from './tools/module.ts';
import { globsFor } from './globs.ts';
import type { ModuleSpec } from './index.ts';

const types = FILE_TYPES;
const modules = [guide, handbook, systems, tools];

// These are the lists the loaders were written with by hand, before they were worked out from the modules.
const sorted = (list: string[]) => [...list].sort();

test('views are listed in prototypes and tools, skipping helpers', () => {
  assert.deepEqual(sorted(globsFor('view', types, modules)), sorted([
    '/prototypes/**/*.{tsx,jsx}', '!/prototypes/**/_*/**', '!/prototypes/**/_*',
    '/tools/**/*.{tsx,jsx}', '!/tools/**/_*/**', '!/tools/**/_*',
  ]));
});

test('canvases are listed in prototypes and tools, skipping helpers', () => {
  assert.deepEqual(sorted(globsFor('canvas', types, modules)), sorted([
    '/prototypes/**/*.excalidraw', '!/prototypes/**/_*/**', '!/prototypes/**/_*',
    '/tools/**/*.excalidraw', '!/tools/**/_*/**', '!/tools/**/_*',
  ]));
});

test('documents are also listed in the Handbook', () => {
  assert.deepEqual(sorted(globsFor('document', types, modules)), sorted([
    '/prototypes/**/*.md', '!/prototypes/**/_*/**', '!/prototypes/**/_*',
    '/tools/**/*.md', '!/tools/**/_*/**', '!/tools/**/_*',
    '/handbook/**/*.md',
  ]));
});

test('the fallback type lists the Handbook files no other type opens', () => {
  assert.deepEqual(globsFor('text', types, modules), ['/handbook/**/*', '!/handbook/**/*.md']);
});

test('without the tools module, nothing looks in /tools', () => {
  const without = modules.filter((m) => m.id !== 'tools');
  for (const id of Object.keys(types)) assert.ok(!globsFor(id, types, without).some((g) => g.includes('/tools/')));
});

test('a new section that holds prototypes is listed by every type that opens prototype files', () => {
  const playbooks: ModuleSpec = { id: 'playbooks', label: 'Playbooks', version: '0.1.0', section: { key: 'playbooks', folder: 'src/playbooks', items: 'prototypes' } };
  assert.ok(globsFor('view', types, [...modules, playbooks]).includes('/playbooks/**/*.{tsx,jsx}'));
  assert.ok(globsFor('document', types, [...modules, playbooks]).includes('!/playbooks/**/_*'));
  assert.ok(!globsFor('text', types, [...modules, playbooks]).some((g) => g.includes('playbooks')));
});

test('an unknown type is named', () => {
  assert.throws(() => globsFor('nope', types, modules), /no "nope" file type/);
});
