import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createSystem } from '../../src/modules/systems/node/create-system.js';

test('system creation requires a current registered Admin and validates input before writing', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-system-create-'));
  try {
    const config = "export default { usage: 'team', admins: ['admin'] };";
    fs.writeFileSync(path.join(root, 'studio.config.ts'), config);
    fs.writeFileSync(path.join(root, 'contributors.json'), JSON.stringify({ admin: { name: 'Admin' }, member: { name: 'Member' } }));
    for (const actor of [null, 'missing', 'member']) assert.throws(() => createSystem(root, actor, { name: 'Product' }), /Admin/);
    for (const body of [null, [], { name: '' }, { name: '42' }, { name: 'Kit', source: '/tmp' }, { name: 'a\ncommand' }]) {
      assert.throws(() => createSystem(root, 'admin', body));
    }
    assert.equal(fs.readFileSync(path.join(root, 'studio.config.ts'), 'utf8'), config);
    assert.equal(fs.existsSync(path.join(root, 'src')), false);
    fs.writeFileSync(path.join(root, 'studio.config.ts'), "export default { usage: 'team', admins: ['member'] };");
    assert.throws(() => createSystem(root, 'admin', { name: 'Kit' }), /Admin/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
