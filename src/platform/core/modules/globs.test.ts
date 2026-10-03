// The patterns each file type's loader lists its files with (globs.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FILE_TYPES } from '../../../../scripts/lib/file-types.js';
import { assertUniqueExtensions, handbookType, matchFileType } from '../fileTypes.ts';
import { globsFor } from './globs.ts';
import type { ModuleSpec } from './index.ts';

const types = FILE_TYPES;
// A file type is removable, so a test about one is skipped when it isn't installed.
const needs = (...ids: string[]) => ({ skip: ids.some((id) => !types[id]) && 'needs a file type that is not installed' });
// Modules as fixtures, so the test still runs when one is removed.
const module = (id: string, section?: ModuleSpec['section']): ModuleSpec => ({ id, label: id, version: '0.1.0', section });
const examples = module('examples', { key: 'examples', folder: 'src/examples', items: 'prototypes' });
const modules = [
  module('prototypes', { key: 'prototypes', folder: 'src/prototypes', items: 'prototypes', byPerson: true }),
  module('documentation', { key: 'documentation', folder: 'src/platform/modules/documentation/pages' }),
  module('handbook', { key: 'handbook', folder: 'src/handbook', items: 'handbook' }),
  module('systems', { key: 'systems', folder: 'src/systems' }),
  examples,
];

// These are the lists the loaders were written with by hand, before they were worked out from the modules.
const sorted = (list: string[]) => [...list].sort();

test('views are listed in prototypes and examples, skipping helpers', needs('view'), () => {
  assert.deepEqual(sorted(globsFor('view', types, modules)), sorted([
    '/prototypes/**/*.{tsx,jsx}', '!/prototypes/**/_*/**', '!/prototypes/**/_*',
    '/examples/**/*.{tsx,jsx}', '!/examples/**/_*/**', '!/examples/**/_*',
  ]));
});

test('canvases are listed in prototypes and examples, skipping helpers', needs('canvas'), () => {
  assert.deepEqual(sorted(globsFor('canvas', types, modules)), sorted([
    '/prototypes/**/*.excalidraw', '!/prototypes/**/_*/**', '!/prototypes/**/_*',
    '/examples/**/*.excalidraw', '!/examples/**/_*/**', '!/examples/**/_*',
  ]));
});

test('prototype documents stay within prototype-shaped sections', needs('document'), () => {
  assert.deepEqual(sorted(globsFor('document', types, modules)), sorted([
    '/prototypes/**/*.md', '!/prototypes/**/_*/**', '!/prototypes/**/_*',
    '/examples/**/*.md', '!/examples/**/_*/**', '!/examples/**/_*',
  ]));
});

test('the fallback type lists the Handbook files no other type opens', needs('text', 'handbook'), () => {
  assert.deepEqual(globsFor('text', types, modules), ['/handbook/**/*', '!/handbook/**/*.md']);
});

test('without the examples module, nothing looks in /examples', () => {
  const without = modules.filter((m) => m !== examples);
  for (const id of Object.keys(types)) assert.ok(!globsFor(id, types, without).some((g) => g.includes('/examples/')));
});

test('a new section that holds prototypes is listed by every type that opens prototype files', needs('view', 'document', 'text'), () => {
  const playbooks: ModuleSpec = { id: 'playbooks', label: 'Playbooks', version: '0.1.0', section: { key: 'playbooks', folder: 'src/playbooks', items: 'prototypes' } };
  assert.ok(globsFor('view', types, [...modules, playbooks]).includes('/playbooks/**/*.{tsx,jsx}'));
  assert.ok(globsFor('document', types, [...modules, playbooks]).includes('!/playbooks/**/_*'));
  assert.ok(!globsFor('text', types, [...modules, playbooks]).some((g) => g.includes('playbooks')));
});

test('an unknown type is named', () => {
  assert.throws(() => globsFor('nope', types, modules), /no "nope" file type/);
});

test('Handbook Markdown stays readable and validated without prototype Documents', () => {
  const { document: _document, ...withoutDocuments } = types;
  assert.equal(matchFileType(withoutDocuments, 'notes.md'), null);
  assert.equal(handbookType(withoutDocuments, 'notes.md'), 'handbook');
  assert.equal(handbookType(withoutDocuments, 'support.js'), 'text');
  assert.deepEqual(globsFor('handbook', withoutDocuments, modules), ['/handbook/**/*.md']);
  assert.deepEqual(globsFor('text', withoutDocuments, modules), ['/handbook/**/*', '!/handbook/**/*.md']);
  assert.match(withoutDocuments.handbook.template!('team-context.md'), /title: Team Context/);
  assert.ok(withoutDocuments.handbook.check!({ source: '---\ntitle: Unclosed', frontmatter: null }).length);
});

const withoutDocument = (specs: typeof types) => Object.fromEntries(Object.entries(specs).filter(([id]) => id !== 'document'));

test('extension ownership is unique within each content scope', () => {
  assert.doesNotThrow(() => assertUniqueExtensions(types));
  assert.throws(() => assertUniqueExtensions({ ...withoutDocument(types), prototypeMarkdown: {extensions: ['.md'], label: 'Markdown'}, other: { extensions: ['.md'], label: 'Other' } }), /both use .md in prototype/);
  assert.throws(() => assertUniqueExtensions({ ...types, other: { extensions: ['.md'], label: 'Other', inPrototype: false, inHandbook: true } }), /both use .md in handbook/);
});
