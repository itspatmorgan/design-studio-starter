import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { applySetupChanges, editStudioConfig, pinImplicitSystems } from './studio-setup.js';
import { readDeclaration } from '../../src/platform/core/modules/pack.ts';

test('configuration edits preserve unrelated customization and validate syntax', () => {
  const original = 'export default { name: "Old", modules: { documentation: false }, /* custom */ extra: 7 } satisfies StudioConfig;';
  const next = editStudioConfig(original, { name: 'Sam\'s Studio', usage: 'personal' });
  assert.match(next, /documentation: false/); assert.match(next, /extra: 7/); assert.match(next, /custom/);
  assert.match(next, /personal/);
  assert.equal(editStudioConfig(next, { name: 'Sam\'s Studio', usage: 'personal' }), next);
  assert.throws(() => editStudioConfig('export default makeConfig();', { name: 'No' }), /default-export an object/);
});

test('local personal setup resumes, then a second clone joins a team without changing configuration', () => {
  const root = path.resolve('.');
  const hasDocumentation = fs.existsSync(path.join(root, 'src/modules/documentation/module.ts'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-onboarding-'));
  const clone = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-contributor-'));
  const copy = (from, to) => {
    fs.cpSync(from, to, { recursive: true, filter: (file) => !['.git', 'node_modules', 'dist'].includes(path.basename(file)) });
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(to, 'node_modules'));
  };
  const run = (cwd, file, ...args) => execFileSync(process.execPath, [file, ...args], { cwd, encoding: 'utf8', timeout: 30000, stdio: 'pipe', env: { ...process.env, MISE_TRUSTED_CONFIG_PATHS: cwd } });
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, stdio: 'pipe' });
  try {
    copy(root, dir);
    // Own the fixture data: a team's real contributors, systems and prototypes are arbitrary.
    fs.rmSync(path.join(dir, 'contributors'), { recursive: true, force: true });
    fs.writeFileSync(path.join(dir, 'contributors.json'), JSON.stringify({ patrick: { name: 'Patrick Morgan', email: '', github: '' } }));
    for (const folder of ['src/prototypes', 'src/systems']) {
      fs.rmSync(path.join(dir, folder), { recursive: true, force: true });
      fs.mkdirSync(path.join(dir, folder), { recursive: true });
    }
    fs.cpSync(path.join(root, 'src/systems/studio'), path.join(dir, 'src/systems/studio'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'studio.config.ts'), `import type { StudioConfig } from './src/platform/core/config.ts';\nexport default { name: 'Fixture Studio', usage: 'team', tagline: 'Fixture', modules: ${JSON.stringify(Object.fromEntries(fs.readdirSync(path.join(dir, 'src/modules')).filter((id) => fs.existsSync(path.join(dir, 'src/modules', id, 'module.ts'))).map((id) => [id, id !== 'documentation'])))}, systems: ['studio'], defaultSystem: 'product' } satisfies StudioConfig;\n`);
    run(dir, 'scripts/cli/studio.js', 'create-system', 'product', '--label', 'Product', '--yes');
    const declared = () => readDeclaration(fs.readFileSync(path.join(dir, 'studio.config.ts'), 'utf8')).value;
    assert.deepEqual(declared().systems, ['studio', 'product']);
    const required = spawnSync(process.execPath, ['scripts/cli/studio.js', 'remove', 'studio', '--yes'], { cwd: dir, encoding: 'utf8' });
    assert.equal(required.status, 1);
    assert.match(required.stderr, /cannot be removed/);
    assert.ok(fs.existsSync(path.join(dir, 'src/systems/studio/system.ts')));
    run(dir, 'scripts/cli/studio.js', 'create-module', 'explicit-fixture');
    assert.equal(fs.existsSync(path.join(dir, 'src/modules/explicit-fixture')), false);
    run(dir, 'scripts/cli/studio.js', 'create-module', 'explicit-fixture', '--yes');
    assert.equal(declared().modules['explicit-fixture'], true);
    run(dir, 'scripts/cli/studio.js', 'disable', 'explicit-fixture');
    assert.equal(declared().modules['explicit-fixture'], false);
    run(dir, 'scripts/cli/studio.js', 'enable', 'explicit-fixture');
    assert.equal(declared().modules['explicit-fixture'], true);
    run(dir, 'scripts/cli/studio.js', 'remove', 'explicit-fixture', '--yes');
    assert.equal(Object.hasOwn(declared().modules, 'explicit-fixture'), false);
    const localPack = path.join(dir, 'local-pack');
    run(dir, 'scripts/cli/studio.js', 'create-module', 'installed-fixture', '--out', localPack, '--yes');
    run(dir, 'scripts/cli/studio.js', 'add', localPack);
    assert.equal(fs.existsSync(path.join(dir, 'src/modules/installed-fixture')), false);
    run(dir, 'scripts/cli/studio.js', 'add', localPack, '--yes');
    assert.equal(declared().modules['installed-fixture'], true);
    assert.ok(fs.existsSync(path.join(dir, 'src/modules/installed-fixture/app.tsx')));
    run(dir, 'scripts/cli/studio.js', 'remove', 'installed-fixture', '--yes');
    fs.rmSync(localPack, { recursive: true });
    run(dir, 'scripts/cli/studio.js', 'create-system', 'brand', '--yes');
    assert.ok(declared().systems.includes('brand'));
    run(dir, 'scripts/cli/studio.js', 'remove', 'brand', '--yes');
    assert.deepEqual(declared().systems, ['studio', 'product']);
    const beforeFailedInstall = fs.readFileSync(path.join(dir, 'studio.config.ts'), 'utf8');
    const pack = path.join(dir, 'failing-pack');
    fs.mkdirSync(pack);
    fs.writeFileSync(path.join(pack, 'module.ts'), "export default { id: 'failing-fixture', label: 'Failing fixture', version: '0.1.0', optional: true, lib: false };\n");
    fs.writeFileSync(path.join(pack, 'check.ts'), "export default () => ['Deliberate fixture failure'];\n");
    assert.throws(() => run(dir, 'scripts/cli/studio.js', 'add', pack, '--yes'), /Command failed/);
    assert.equal(fs.readFileSync(path.join(dir, 'studio.config.ts'), 'utf8'), beforeFailedInstall);
    assert.equal(fs.existsSync(path.join(dir, 'src/modules/failing-fixture')), false);
    fs.rmSync(pack, { recursive: true });
    git(dir, 'init', '-q');
    git(dir, 'config', 'user.name', 'Patrick Morgan'); git(dir, 'config', 'user.email', 'legacy@example.test');
    assert.equal(run(dir, 'scripts/cli/resolve-contributor.js').trim(), 'patrick');
    run(dir, 'src/modules/prototypes/node/create.js', 'Sample');
    git(dir, 'config', 'user.name', 'Sam Solo'); git(dir, 'config', 'user.email', 'sam@gmail.com');
    assert.equal(spawnSync(process.execPath, ['scripts/cli/resolve-contributor.js'], {cwd:dir,encoding:'utf8'}).status, 1);
    const config = path.join(dir, 'studio.config.ts'); const before = fs.readFileSync(config, 'utf8');
    run(dir, 'scripts/cli/studio.js', 'configure', '--name', 'Personal Studio', '--usage', 'personal');
    assert.equal(fs.readFileSync(config, 'utf8'), before);
    const invalid = spawnSync(process.execPath, ['scripts/cli/studio.js', 'configure', '--usage', 'unknown', '--yes'], { cwd: dir, encoding: 'utf8' });
    assert.equal(invalid.status, 1); assert.equal(fs.readFileSync(config, 'utf8'), before);
    run(dir, 'scripts/cli/studio.js', 'configure', '--name', 'Personal Studio', '--usage', 'personal', '--yes');
    const join = ['--key', 'sam', '--name', 'Sam Solo', '--email', 'sam@gmail.com', '--yes'];
    assert.doesNotMatch(run(dir, 'scripts/cli/setup-contributor.js', ...join), /Warning:/);
    const contributor = fs.readFileSync(path.join(dir, 'contributors/sam.json'), 'utf8');
    assert.match(run(dir, 'scripts/cli/setup-contributor.js', ...join), /already/);
    assert.equal(fs.readFileSync(path.join(dir, 'contributors/sam.json'), 'utf8'), contributor);
    assert.equal(run(dir, 'scripts/cli/resolve-contributor.js').trim(), 'sam');
    run(dir, 'scripts/cli/studio.js', 'create-system', 'acme', '--label', 'Acme', '--yes');
    run(dir, 'scripts/cli/studio.js', 'configure', '--system', 'acme', '--yes');
    const components = path.join(dir, 'src/systems/acme/components/button');
    fs.mkdirSync(components, { recursive: true });
    fs.writeFileSync(path.join(components, 'index.tsx'), 'export function Button(){return <button className="bg-primary text-primary-foreground">Continue</button>}');
    const script = `import {createPrototype} from './src/modules/prototypes/node/create.js'; import fs from 'node:fs'; const {slug}=createPrototype({title:'First Flow',key:'sam'}); const dir='src/prototypes/sam/'+slug; fs.writeFileSync(dir+'/prototype.tsx','import { Button } from \"@/systems/acme/components/button\"; export default function View(){return <Button/>}'); fs.writeFileSync(dir+'/context.md','# First flow\\nA local setup example.'); fs.writeFileSync(dir+'/flow.excalidraw',JSON.stringify({type:'excalidraw',version:2,elements:[],appState:{},files:{}}));`;
    execFileSync(process.execPath, ['--input-type=module', '--eval', script], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
    run(dir, 'scripts/build/build-manifest.js', '--strict');
    const status = JSON.parse(run(dir, 'scripts/cli/studio.js', 'status', '--json'));
    assert.equal(status.config.defaultSystem, 'acme'); assert.equal(status.contributor, 'sam');
    assert.equal(status.modules.disabled.includes('documentation'), hasDocumentation);
    // Retire the sample's dependency in this disposable copy only, before replacing Product.
    fs.rmSync(path.join(dir, 'src/prototypes/patrick'), { recursive: true, force: true });
    run(dir, 'scripts/cli/studio.js', 'remove', 'product', '--yes');
    run(dir, 'scripts/build/build-manifest.js', '--strict');
    run(dir, 'node_modules/typescript/bin/tsc', '-b');
    run(dir, 'node_modules/vite/bin/vite.js', 'build');
    run(dir, 'scripts/cli/studio.js', 'configure', '--usage', 'team', '--yes');
    copy(dir, clone);
    git(clone, 'init', '-q'); git(clone, 'config', 'user.name', 'Alex Partner'); git(clone, 'config', 'user.email', 'alex@example.test');
    const sharedConfig = fs.readFileSync(path.join(clone, 'studio.config.ts'), 'utf8');
    run(clone, 'scripts/cli/setup-contributor.js', '--key', 'alex', '--name', 'Alex Partner', '--email', 'alex@example.test', '--github', 'alex-test', '--yes');
    assert.equal(run(clone, 'scripts/cli/resolve-contributor.js').trim(), 'alex');
    assert.equal(fs.readFileSync(path.join(clone, 'studio.config.ts'), 'utf8'), sharedConfig);
    assert.equal(fs.readFileSync(path.join(clone, 'contributors/sam.json'), 'utf8'), contributor);
    const collision = spawnSync(process.execPath, ['scripts/cli/setup-contributor.js', '--key', 'wrong', '--name', 'Wrong', '--email', 'alex@example.test', '--yes'], { cwd: clone, encoding: 'utf8' });
    assert.equal(collision.status, 1); assert.equal(fs.existsSync(path.join(clone, 'contributors/wrong.json')), false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(clone, { recursive: true, force: true }); }
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
