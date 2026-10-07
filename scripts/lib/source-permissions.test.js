import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { writeProfiles } from './fixtures/contributors.js';
import { canWriteSource } from '../build/files/policy.js';

test('source writes recheck revoked grants and archive status without waiting for a restart', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-source-permissions-'));
  const config = { usage: 'team', admins: ['admin'], systems: ['studio', 'product'], systemMaintainers: { product: ['sam'] } };
  const save = () => fs.writeFileSync(path.join(root, 'studio.config.ts'), 'export default ' + JSON.stringify(config) + ';');
  try {
    writeProfiles(root, { admin: { name: 'Admin' }, sam: { name: 'Sam' } });
    fs.mkdirSync(path.join(root, 'src/systems/product'), { recursive: true });
    const spec = path.join(root, 'src/systems/product/system.ts');
    fs.writeFileSync(spec, "export default { role: 'prototype', status: 'active' };"); save();
    assert.equal(canWriteSource('sam', 'src/systems/product/components/button.tsx', root), true);
    assert.equal(canWriteSource('sam', 'src/platform/core/config.ts', root), false);
    assert.equal(canWriteSource('admin', 'src/prototypes/sam/example/view.tsx', root), true);
    assert.equal(canWriteSource('sam', 'src/prototypes/admin/example/view.tsx', root), false);
    assert.equal(canWriteSource('sam', '../src/systems/product/system.ts', root), false);
    assert.equal(canWriteSource('sam', 'src/systems/product/system.ts', root, "export default { role: 'prototype', status: 'archived' };"), false);
    assert.equal(canWriteSource('sam', 'src/systems/product/system.ts', root, "export default { role: 'prototype', status: 'active', description: 'Updated' };"), true);
    config.systemMaintainers.product = []; save();
    assert.equal(canWriteSource('sam', 'src/systems/product/components/button.tsx', root), false);
    config.systemMaintainers.product = ['sam']; save();
    fs.writeFileSync(spec, "export default { role: 'prototype', status: 'archived' };");
    assert.equal(canWriteSource('sam', 'src/systems/product/components/button.tsx', root), false);
    assert.equal(canWriteSource('admin', 'src/systems/product/components/button.tsx', root), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
