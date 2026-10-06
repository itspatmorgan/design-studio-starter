import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { systemAction } from './system-actions.js';
import { planSystemLifecycle, applySystemLifecycle } from './system-lifecycle.js';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-system-actions-'));
  const config = { usage: 'team', admins: ['admin'], systems: ['studio', 'kit', 'other'], defaultSystem: 'other' };
  fs.writeFileSync(path.join(root, 'studio.config.ts'), `export default ${JSON.stringify(config)};`);
  fs.writeFileSync(path.join(root, 'contributors.json'), JSON.stringify({ admin: { name: 'Admin' }, member: { name: 'Member' } }));
  for (const id of config.systems) {
    fs.mkdirSync(path.join(root, 'src/systems', id, 'components'), { recursive: true });
    fs.writeFileSync(path.join(root, 'src/systems', id, 'system.ts'), `// preserve comment\nexport default { status: 'active', role: '${id === 'studio' ? 'platform' : 'prototype'}', label: '${id}', themeClass: '${id}-theme' };`);
  }
  function proto(id, meta) {
    const dir = path.join(root, 'src/prototypes/admin', id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ title: id, system: 'kit', ...meta }));
    fs.writeFileSync(path.join(dir, 'view.tsx'), "import { Button } from '@/systems/kit/components/button'; export default Button;");
    return path.join(dir, 'meta.json');
  }
  return { root, config, proto };
}

test('system actions recheck Admin roles, protect Studio, default and unsafe identities', async () => {
  const { root, config } = fixture();
  try {
    for (const actor of [null, 'missing', 'member']) await assert.rejects(systemAction(root, actor, { action: 'rename', system: 'kit', name: 'Changed' }));
    for (const action of ['rename', 'default', 'archive', 'delete', 'restore']) await assert.rejects(systemAction(root, 'admin', { action, system: 'studio', name: 'Changed' }), /protected/);
    for (const action of ['archive-check', 'delete-check']) await assert.rejects(systemAction(root, 'admin', { action, system: 'other' }), /another default/);
    for (const system of ['../kit', 'missing']) await assert.rejects(systemAction(root, 'admin', { action: 'rename', system, name: 'Changed' }), /registered/);
    await assert.rejects(systemAction(root, 'admin', { action: 'rename', system: 'kit', name: 'a\ncommand' }), /plain name/);
    fs.writeFileSync(path.join(root, 'studio.config.ts'), `export default ${JSON.stringify({ ...config, admins: ['member'] })};`);
    await assert.rejects(systemAction(root, 'admin', { action: 'archived' }), /Admin/);
    assert.deepEqual(await systemAction(root, 'member', { action: 'archived' }), { items: [] });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('archive and restore track only prototypes archived together; delete preserves rebuild source', () => {
  const { root, config, proto } = fixture();
  try {
    const active = proto('active', {}), old = proto('old', { status: 'archived' });
    applySystemLifecycle(planSystemLifecycle(root, config, 'archive', 'kit'));
    assert.equal(JSON.parse(fs.readFileSync(active)).archivedBySystem, 'kit');
    assert.equal(JSON.parse(fs.readFileSync(old)).archivedBySystem, undefined);
    applySystemLifecycle(planSystemLifecycle(root, config, 'restore', 'kit', { restorePrototypes: true }));
    assert.equal(JSON.parse(fs.readFileSync(active)).status, undefined);
    assert.equal(JSON.parse(fs.readFileSync(old)).status, 'archived');
    const before = fs.readFileSync(path.join(path.dirname(active), 'view.tsx'), 'utf8');
    applySystemLifecycle(planSystemLifecycle(root, config, 'delete', 'kit'));
    assert.equal(fs.existsSync(path.join(root, 'src/systems/kit')), false);
    assert.equal(fs.existsSync(path.join(root, '.trash')), false);
    assert.deepEqual(JSON.parse(fs.readFileSync(active)).systemMissing, { id: 'kit', label: 'kit' });
    assert.equal(fs.readFileSync(path.join(path.dirname(active), 'view.tsx'), 'utf8'), before);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('true rename repairs assignment, imports, links, registration and rolls back a failed validation', () => {
  const { root, config, proto } = fixture();
  try {
    const meta = proto('example', { rebuild: { targetSystem: 'kit', source: 'src/prototypes/admin/example' } });
    fs.writeFileSync(path.join(root, 'src/systems/kit/components/button.tsx'), 'export const Button = () => null;');
    fs.writeFileSync(path.join(root, 'README.md'), '[Kit](src/systems/kit/system.ts) [Overview](/systems/kit) [External](https://example.com/systems/kit/button)');
    fs.writeFileSync(path.join(root, 'src/systems/kit/components/button.css'), '@import "./button-theme.css";');
    fs.writeFileSync(path.join(root, 'src/systems/kit/components/button-theme.css'), '.button { color: red; }');
    const plan = planSystemLifecycle(root, config, 'rename', 'kit', { name: 'Team Kit' });
    assert.throws(() => applySystemLifecycle(plan, () => { throw new Error('check failed'); }), /check failed/);
    assert.equal(fs.existsSync(path.join(root, 'src/systems/kit')), true);
    assert.equal(JSON.parse(fs.readFileSync(meta)).system, 'kit');
    applySystemLifecycle(planSystemLifecycle(root, config, 'rename', 'kit', { name: 'Team Kit' }));
    assert.equal(JSON.parse(fs.readFileSync(meta)).system, 'team-kit');
    assert.equal(JSON.parse(fs.readFileSync(meta)).rebuild.targetSystem, 'team-kit');
    assert.match(fs.readFileSync(path.join(path.dirname(meta), 'view.tsx'), 'utf8'), /@\/systems\/team-kit\//);
    assert.match(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /\/systems\/team-kit\)/);
    assert.match(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /https:\/\/example.com\/systems\/kit\/button/);
    assert.match(fs.readFileSync(path.join(root, 'src/systems/team-kit/components/button.css'), 'utf8'), /\.\/button-theme\.css/);
    const spec = fs.readFileSync(path.join(root, 'src/systems/team-kit/system.ts'), 'utf8');
    assert.match(spec, /preserve comment/); assert.match(spec, /kit-theme/); assert.match(spec, /Team Kit/);
    assert.throws(() => planSystemLifecycle(root, { ...config, systems: ['studio', 'team-kit', 'other'] }, 'rename', 'team-kit', { name: 'Other' }), /already/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
