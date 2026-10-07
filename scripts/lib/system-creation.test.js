import { writeProfiles } from './fixtures/contributors.js';
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
    writeProfiles(root, { admin: { name: 'Admin' }, member: { name: 'Member' } });
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

test('creation keeps partial scaffolds private and releases its transaction after success or failure', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-system-create-'));
  try {
    fs.writeFileSync(path.join(root, 'studio.config.ts'), "export default { usage: 'team', admins: ['admin'] };");
    writeProfiles(root, { admin: { name: 'Admin' } });
    fs.mkdirSync(path.join(root, 'scripts/cli'), { recursive: true });
    fs.writeFileSync(path.join(root, 'scripts/cli/studio.js'), `
      const fs = require('node:fs');
      if (!fs.existsSync('.studio-system-operation')) process.exit(2);
      setTimeout(() => {
        if (process.argv.includes('broken')) { console.error('Scaffold validation failed'); process.exit(1); }
        fs.appendFileSync('calls', process.argv.includes('--yes') ? 'apply\\n' : 'preview\\n');
      }, 40);
    `);
    const pending = createSystem(root, 'admin', { name: 'Kit' });
    assert.equal(fs.existsSync(path.join(root, '.studio-system-operation')), true);
    await assert.rejects(createSystem(root, 'admin', { name: 'Other' }), /in progress/);
    assert.equal(fs.existsSync(path.join(root, '.studio-system-operation')), true);
    assert.deepEqual(await pending, { id: 'kit' });
    assert.equal(fs.readFileSync(path.join(root, 'calls'), 'utf8'), 'preview\napply\n');
    assert.equal(fs.existsSync(path.join(root, '.studio-system-operation')), false);
    await assert.rejects(createSystem(root, 'admin', { name: 'Broken' }), /Scaffold validation failed/);
    assert.equal(fs.existsSync(path.join(root, '.studio-system-operation')), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
