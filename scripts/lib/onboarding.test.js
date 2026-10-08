import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { applySetupChanges, editStudioConfig, pinImplicitSystems } from './studio-setup.js';
import { readDeclaration } from '../../src/platform/core/modules/pack.ts';

test('configuration edits preserve unrelated customization and validate syntax', () => {
  const original = 'export default { name: "Old", modules: { documentation: false }, /* custom */ extra: 7 } satisfies StudioConfig;';
  const next = editStudioConfig(original, { name: 'Sam\'s Studio', usage: 'personal' });
  assert.match(next, /documentation: false/); assert.match(next, /extra: 7/); assert.match(next, /custom/);
  assert.match(next, /personal/);
  assert.equal(editStudioConfig(next, { name: 'Sam\'s Studio', usage: 'personal' }), next);
  assert.throws(() => editStudioConfig('export default makeConfig();', { name: 'No' }), /default-export an object/);
  assert.throws(() => editStudioConfig('export default { name: "First", "name": "Second" };', { name: 'New' }), /duplicate/);
  assert.throws(() => editStudioConfig('export default { modules: { notes: true, "notes": false } };', { modules: { notes: true } }), /duplicate/);
  const commented = 'export default {\n  modules: { /* keep module note */ "notes": true },\n  defaultSystem: "product", // keep default note\n};\n';
  const withAdmins = editStudioConfig(commented, { admins: ['sam'], modules: { notes: false } });
  assert.match(withAdmins, /keep module note/); assert.match(withAdmins, /keep default note/);
  assert.deepEqual(readDeclaration(withAdmins).value.admins, ['sam']);
  assert.equal(readDeclaration(withAdmins).value.modules.notes, false);
  assert.deepEqual(readDeclaration(editStudioConfig('export default {name:"Old"}', { admins: ['sam'] })).value.admins, ['sam']);
});



test('default-system migration pins implicit content, preserves explicit systems, and rejects stale plans', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-system-switch-'));
  try {
    const personal = path.join(root, 'src/prototypes/sam/retained');
    const sectionItem = path.join(root, 'src/examples/retained');
    const explicit = path.join(root, 'src/prototypes/sam/explicit');
    for (const folder of [personal, sectionItem, explicit]) fs.mkdirSync(folder, { recursive: true });
    const implicitText = '{"title":"Retained","order":["main.tsx"]}';
    fs.writeFileSync(path.join(personal, 'meta.json'), implicitText);
    fs.writeFileSync(path.join(sectionItem, 'meta.json'), '{"title":"Disabled section item","maintainers":["sam"]}');
    const explicitText = '{"title":"Explicit","system":"brand"}';
    fs.writeFileSync(path.join(explicit, 'meta.json'), explicitText);
    const modules = [{ section: { items: 'prototypes', folder: 'src/examples' } }];
    const planned = pinImplicitSystems(root, 'product', modules);
    assert.equal(planned.length, 2);
    assert.equal(fs.readFileSync(path.join(personal, 'meta.json'), 'utf8'), implicitText);
    fs.writeFileSync(path.join(sectionItem, 'meta.json'), '{"title":"Concurrent change"}');
    assert.throws(() => applySetupChanges(planned), /changed/);
    assert.equal(fs.readFileSync(path.join(personal, 'meta.json'), 'utf8'), implicitText);
    applySetupChanges(pinImplicitSystems(root, 'product', modules));
    assert.equal(JSON.parse(fs.readFileSync(path.join(personal, 'meta.json'))).system, 'product');
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(personal, 'meta.json'))).order, ['main.tsx']);
    assert.equal(JSON.parse(fs.readFileSync(path.join(sectionItem, 'meta.json'))).system, 'product');
    assert.equal(fs.readFileSync(path.join(explicit, 'meta.json'), 'utf8'), explicitText);
    assert.deepEqual(pinImplicitSystems(root, 'product', modules), []);
    fs.writeFileSync(path.join(sectionItem, 'meta.json'), '{');
    assert.throws(() => pinImplicitSystems(root, 'product', modules), /invalid JSON/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
