import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { manifestOutputs, syncManifests } from './sync-manifest.mjs';

test('host packages resolve the same skills, helper, and identity', () => {
  const root = new URL('../', import.meta.url);
  const portable = JSON.parse(fs.readFileSync(new URL('plugin.json', root), 'utf8'));
  syncManifests(true);
  for (const [relative, manifest] of manifestOutputs(portable)) {
    if (!relative.endsWith('/plugin.json')) continue;
    assert.equal(manifest.name, portable.name);
    assert.equal(manifest.version, portable.version);
    const skills = new URL(manifest.skills, root);
    for (const name of ['create-studio', 'open-studio', 'use-studio']) {
      assert.ok(fs.existsSync(new URL(`${name}/SKILL.md`, skills)));
    }
    assert.ok(fs.existsSync(new URL('scripts/bootstrap.mjs', root)));
    if (manifest.logo) assert.ok(fs.existsSync(new URL(manifest.logo, root)));
  }
});

test('marketplace sources remain inside the repo and point at the shared package', () => {
  const root = new URL('../', import.meta.url);
  const portable = JSON.parse(fs.readFileSync(new URL('plugin.json', root), 'utf8'));
  for (const [relative, marketplace] of manifestOutputs(portable)) {
    if (!relative.endsWith('/marketplace.json')) continue;
    assert.equal(marketplace.plugins.length, 1);
    const repo = new URL('../', new URL(relative, root));
    const source = new URL(marketplace.plugins[0].source + '/', repo);
    assert.equal(source.href, root.href);
    assert.ok(fs.existsSync(new URL('skills/create-studio/SKILL.md', source)));
  }
});
