import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { platformReferences } from './platform-references.js';

test('reference instructions follow the specific source and omit examples and external links', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-reference-'));
  const write = (file, text) => { const target = path.join(root, 'src', file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, text); };
  try {
    write('platform/core/config.md', '---\nreferenceSection: operate\nreferenceOrder: 20\n---\n# Configuration');
    write('platform/core/source.md', '# Editing');
    write('modules/example/README.md', '# Example');
    write('modules/example/reference.md', '# Example contract');
    write('systems/studio/rules/configure.md', '# Configure\n[Config](../../../platform/core/config.md#fields)');
    write('systems/studio/rules/edit.md', '# Edit\n[Editing](/documentation/reference/platform/core/source.md)\n[Remote](https://example.com/config.md)\n```md\n[Config](../../../platform/core/config.md)\n```');
    write('systems/studio/rules/example.md', '# Example workflow');
    const systemContent = [{ contributorKey: 'system-content', id: 'studio:rules', system: 'studio', title: 'Rules', artifacts: ['configure.md', 'edit.md', 'example.md'].map(path => ({path})) }];
    const modules = [{ id: 'example', label: 'Example', instructions: [{path: 'rules/example.md'}] }];
    const groups = platformReferences({root, modules, enabled: ['example'], systemContent});
    const core = groups.find(g => g.id === 'core');
    const config = core.references.find(r => r.source.endsWith('/config.md'));
    const source = core.references.find(r => r.source.endsWith('/source.md'));
    assert.equal(config.section, 'operate');
    assert.equal(source.section, 'extend', 'unclassified pages remain discoverable');
    assert.deepEqual(config.related.map(r => r.title), ['studio · Rules · Configure']);
    assert.deepEqual(source.related.map(r => r.title), ['studio · Rules · Edit']);
    const example = groups.find(g => g.id === 'example');
    assert.equal(example.references.find(r => r.source.endsWith('/README.md')).related.length, 1);
    assert.equal(example.references.find(r => r.source.endsWith('/reference.md')).related.length, 0, 'declarations orient the module, not every contract');
    const disabled = platformReferences({root, modules, enabled: [], systemContent}).find(g => g.id === 'example');
    assert.deepEqual(disabled.references, [], 'disabled capabilities have no reading or search targets');
  } finally { fs.rmSync(root, {recursive: true, force: true}); }
});
