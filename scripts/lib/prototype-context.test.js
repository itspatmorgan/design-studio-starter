import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { prototypeContext } from './prototype-context.js';
import { prototypeAssignment } from './prototype-assignment.js';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-prototype-context-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const folder = 'src/prototypes/alex/checkout';
  fs.mkdirSync(path.join(root, folder), { recursive: true });
  for (const id of ['product', 'brand', 'studio']) {
    fs.mkdirSync(path.join(root, 'src/systems', id), { recursive: true });
    fs.writeFileSync(path.join(root, 'src/systems', id, 'AGENTS.md'), `# ${id}`);
  }
  const options = { root, folder, contributor: 'alex', contributors: ['alex', 'sam'],
    config: { usage: 'team', admins: ['sam'], systems: ['product', 'brand', 'studio'], defaultSystem: 'product' },
    systems: { product: { role: 'prototype', status: 'active' }, brand: { role: 'prototype', status: 'active' }, studio: { role: 'platform', status: 'active' } },
    modules: [{ id: 'prototypes' }, { id: 'systems' }] };
  const write = meta => fs.writeFileSync(path.join(root, folder, 'meta.json'), JSON.stringify({ title: 'Checkout', ...meta }));
  return { options, write };
}

test('context keeps None, default, named assignment, and rebuild target distinct without writes', t => {
  const { options, write } = fixture(t);
  for (const [meta, expected, source] of [[{}, 'product', 'default'], [{ system: null }, null, 'explicit'], [{ system: 'brand' }, 'brand', 'explicit']]) {
    write(meta);
    const before = fs.readFileSync(path.join(options.root, options.folder, 'meta.json'));
    const result = prototypeContext(options);
    assert.equal(result.assignment.system, expected);
    assert.equal(result.assignment.source, source);
    assert.equal(result.assignment.entry ?? null, expected === null ? null : `src/systems/${expected}/AGENTS.md`);
    assert.equal(result.contributor.canEdit, true);
    assert.deepEqual(result.modules.enabled, ['prototypes', 'systems']);
    assert.deepEqual(fs.readFileSync(path.join(options.root, options.folder, 'meta.json')), before);
    assert.equal(fs.existsSync(path.join(options.root, 'public')), false);
  }
  write({ system: 'product', rebuild: { targetSystem: null, source: 'src/prototypes/sam/original' } });
  const none = prototypeContext(options);
  assert.equal(none.assignment.system, 'product');
  assert.equal(none.rebuild.targetSystem, null);
  assert.equal(none.rebuild.target, null);
  write({ system: null, rebuild: { targetSystem: 'brand', source: 'src/prototypes/sam/original' } });
  assert.equal(prototypeContext(options).rebuild.target.entry, 'src/systems/brand/AGENTS.md');
});

test('context distinguishes access, archived work, and deleted systems from invalid assignments', t => {
  const { options, write } = fixture(t);
  write({ system: 'retired', systemMissing: { id: 'retired', label: 'Retired kit' } });
  assert.equal(prototypeContext(options).assignment.status, 'missing');
  assert.equal(prototypeContext({ ...options, contributor: 'other' }).contributor.canEdit, false);
  write({ status: 'archived' });
  assert.equal(prototypeContext({ ...options, contributor: 'sam' }).contributor.canEdit, false);
  for (const meta of [{ system: 'studio' }, { system: 'unknown' }, { system: 'retired' }, { system: null, systemMissing: { id: null, label: 'Missing' } }, { rebuild: { targetSystem: 'unknown', source: 'src/prototypes/sam/original' } }, { rebuild: { targetSystem: null, source: '../outside' } }, { status: 'invented' }]) {
    write(meta);
    assert.throws(() => prototypeContext(options));
  }
  write({ system: 'brand' });
  assert.throws(() => prototypeContext({ ...options, config: { ...options.config, systems: ['product', 'studio'] } }), /registered prototype system/);
});

test('inspection rejects escaping paths, nested artifacts, and symbolic links', t => {
  const { options, write } = fixture(t);
  write({});
  for (const folder of ['../outside', 'src/systems/product', options.folder + '/view.tsx']) assert.throws(() => prototypeContext({ ...options, folder }));
  const alias = 'src/prototypes/alex/alias';
  fs.symlinkSync(path.join(options.root, options.folder), path.join(options.root, alias));
  assert.throws(() => prototypeContext({ ...options, folder: alias }), /symbolic links/);
  const meta = path.join(options.root, options.folder, 'meta.json');
  fs.renameSync(meta, meta + '.original');
  fs.symlinkSync(meta + '.original', meta);
  assert.throws(() => prototypeContext(options), /ordinary file/);
});

test('manifest assignment validation rejects stale deletion markers and invalid rebuild sources', () => {
  const systems = { product: {}, brand: {} };
  assert.equal(prototypeAssignment({ system: null }, 'product', systems).system, null);
  assert.equal(prototypeAssignment({}, 'product', systems).system, 'product');
  assert.equal(prototypeAssignment({ system: 'brand', systemMissing: { id: 'brand', label: 'Brand' } }, 'product', systems).problems.length, 1);
  assert.equal(prototypeAssignment({ rebuild: { targetSystem: 'brand', source: 'src/prototypes/alex/original' } }, 'product', systems).problems.length, 0);
  assert.equal(prototypeAssignment({ rebuild: { targetSystem: null } }, 'product', systems).problems.length, 1);
});
