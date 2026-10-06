import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { systemAction } from './system-actions.js';

test('system actions enforce current Admin roles and protect source paths and Studio identity', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-system-actions-'));
  try {
    const config = "export default { usage: 'team', admins: ['admin'], systems: ['studio', 'kit'], defaultSystem: 'kit' };";
    fs.writeFileSync(path.join(root, 'studio.config.ts'), config);
    fs.writeFileSync(path.join(root, 'contributors.json'), JSON.stringify({ admin: { name: 'Admin' }, member: { name: 'Member' } }));
    for (const id of ['studio', 'kit']) {
      fs.mkdirSync(path.join(root, 'src/systems', id), { recursive: true });
      fs.writeFileSync(path.join(root, 'src/systems', id, 'system.ts'), `// preserve this comment\nexport default { role: '${id === 'studio' ? 'platform' : 'prototype'}', label: '${id}', themeClass: 'kit-theme' };`);
    }
    for (const actor of [null, 'missing', 'member']) await assert.rejects(systemAction(root, actor, { action: 'rename', system: 'kit', name: 'Changed' }));
    for (const action of ['rename', 'default', 'remove', 'remove-check']) await assert.rejects(systemAction(root, 'admin', { action, system: 'studio', name: 'Changed' }), /protected/);
    await assert.rejects(systemAction(root, 'admin', { action: 'remove-check', system: 'kit' }), /Choose another default/);
    for (const system of ['../kit', 'missing']) await assert.rejects(systemAction(root, 'admin', { action: 'rename', system, name: 'Changed' }), /registered/);
    await assert.rejects(systemAction(root, 'admin', { action: 'restore', key: '../kit' }), /removed/);
    await assert.rejects(systemAction(root, 'admin', { action: 'rename', system: 'kit', name: 'a\ncommand' }), /plain name/);
    await systemAction(root, 'admin', { action: 'rename', system: 'kit', name: 'Team kit' });
    const text = fs.readFileSync(path.join(root, 'src/systems/kit/system.ts'), 'utf8');
    assert.match(text, /preserve this comment/);
    assert.match(text, /label: "Team kit"/);
    assert.match(text, /themeClass: 'kit-theme'/);
    assert.equal(fs.readFileSync(path.join(root, 'studio.config.ts'), 'utf8'), config);
    fs.writeFileSync(path.join(root, 'studio.config.ts'), config.replace('systems:', 'modules: { kit: false }, systems:'));
    await assert.rejects(systemAction(root, 'admin', { action: 'remove-check', system: 'kit' }), /conflicts with a module/);
    const key = '00000000-0000-0000-0000-000000000000';
    const backup = path.join(root, '.trash/systems', key);
    fs.mkdirSync(backup, { recursive: true });
    fs.writeFileSync(path.join(backup, 'record.json'), JSON.stringify({ id: 'kit', label: 'Kit', state: 'removed' }));
    await assert.rejects(systemAction(root, 'admin', { action: 'restore', key }), /already exists/);
    fs.writeFileSync(path.join(root, 'studio.config.ts'), config.replace("admins: ['admin']", "admins: ['member']"));
    await assert.rejects(systemAction(root, 'admin', { action: 'removed' }), /Admin/);
    assert.equal((await systemAction(root, 'member', { action: 'removed' })).items[0].key, key);
    fs.writeFileSync(path.join(backup, 'record.json'), JSON.stringify({ id: 'kit', label: 'Kit', state: 'pending' }));
    assert.deepEqual(await systemAction(root, 'member', { action: 'removed' }), { items: [] });
    fs.rmSync(path.join(root, 'src/systems/kit'), { recursive: true });
    assert.equal((await systemAction(root, 'member', { action: 'removed' })).items[0].key, key);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
