import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { personAddress, moveWithLinks } from './prototype-links.js';
import { archiveEntries, extractArchive, boundedDownload } from './source-archive.js';
import importGuard from '../build/vite-import-guard-plugin.js';

function tar(name, type = '0', data = Buffer.from('hello')) {
  const header = Buffer.alloc(512);
  header.write(name);
  header.write('0000644\0', 100);
  header.write(data.length.toString(8).padStart(11, '0') + '\0', 124);
  header.fill(32, 148, 156);
  header.write(type, 156);
  header.write('ustar\0', 257);
  const sum = header.reduce((a, b) => a + b, 0);
  header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
  return gzipSync(Buffer.concat([header, data, Buffer.alloc((512 - data.length % 512) % 512), Buffer.alloc(1024)]));
}

test('rename migrates canonical and legacy links without changing external URLs or longer slugs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-links-'));
  try {
    const from = path.join(dir, 'old'), to = path.join(dir, 'new');
    fs.mkdirSync(from);
    fs.writeFileSync(path.join(from, 'meta.json'), '{"title":"Old"}');
    fs.writeFileSync(path.join(from, 'flow.excalidraw'), JSON.stringify({ elements: [{ link: '/prototypes/sam/old/view' }] }));
    fs.writeFileSync(path.join(from, 'notes.md'), '[/sam/old/view](/sam/old/view) https://other.test/sam/old/view /sam/older/view');
    moveWithLinks(from, to, { title: 'New' }, personAddress('sam', 'old'), '/prototypes/sam/new');
    assert.equal(fs.existsSync(from), false);
    assert.match(fs.readFileSync(path.join(to, 'flow.excalidraw'), 'utf8'), /\/prototypes\/sam\/new\/view/);
    assert.equal(fs.readFileSync(path.join(to, 'notes.md'), 'utf8'), '[/prototypes/sam/new/view](/prototypes/sam/new/view) https://other.test/sam/old/view /sam/older/view');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('archives are validated before extraction and reject traversal, links, truncation and oversized entries', () => {
  assert.equal(archiveEntries(tar('pack/module.ts'))[0].data.toString(), 'hello');
  for (const name of ['../escape', '/escape', 'pack/../../escape']) assert.throws(() => archiveEntries(tar(name)), /path/);
  for (const type of ['1', '2', 'S']) assert.throws(() => archiveEntries(tar('link', type)), /regular files/);
  assert.throws(() => archiveEntries(tar('large', '0', Buffer.alloc(2 * 1024 * 1024 + 1))), /larger/);
  assert.throws(() => archiveEntries(gzipSync(Buffer.alloc(100))), /truncated/);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-archive-'));
  try {
    assert.throws(() => extractArchive(tar('../escape'), dir));
    assert.deepEqual(fs.readdirSync(dir), []);
    extractArchive(tar('pack/module.ts'), dir);
    assert.equal(fs.readFileSync(path.join(dir, 'pack/module.ts'), 'utf8'), 'hello');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('download enforces its limit while streaming', async () => {
  assert.equal((await boundedDownload(new Response('hello'), 5)).toString(), 'hello');
  await assert.rejects(boundedDownload(new Response('hello!'), 5), /larger/);
});

test('prototype import allowlist includes its system and rejects unrelated local code', async () => {
  const guard = importGuard();
  guard.configResolved({ command: 'build' });
  const root = path.resolve('src/prototypes/patrick/import-fixture');
  for (const [target, allowed] of [['src/systems/product/components/button/index.ts', true], ['src/lib/store.ts', true], ['src/prototypes/patrick/import-fixture/_components/text.ts', true], ['scripts/lib/random.js', false], ['src/platform/app/router.tsx', false], ['src/prototypes/patrick/feedback-inbox/main.tsx', false]]) {
    const context = { resolve: async () => ({ id: path.resolve(target) }), error: (message) => { throw new Error(message); } };
    const request = guard.resolveId.call(context, './thing', path.join(root, 'main.tsx'), {});
    if (allowed) await request; else await assert.rejects(request, /Prototype scope/);
  }
});

test('create and rename preserve addresses, file errors recover, and system removal protects prototypes', async () => {
  const { execFileSync } = await import('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-journey-'));
  const root = path.resolve('.');
  try {
    fs.cpSync(root, dir, { recursive: true, filter: (file) => !['node_modules', 'dist', '.git'].includes(path.basename(file)) });
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'));
    const script = `
      import fs from 'node:fs';
      import path from 'node:path';
      import assert from 'node:assert/strict';
      import { pathToFileURL } from 'node:url';
      const load = (file) => import(pathToFileURL(path.resolve(file)).href);
      const { createPrototype, renamePrototype } = await load('src/platform/modules/' + 'prototypes/node/create.js');
      const { slug } = createPrototype({ title: 'Beta Journey', key: 'patrick' });
      const original = path.resolve('src/prototypes/patrick', slug);
      fs.writeFileSync(path.join(original, 'notes.md'), '[View](/prototypes/patrick/beta-journey/main)');
      fs.writeFileSync(path.join(original, 'flow.excalidraw'), JSON.stringify({ type: 'excalidraw', version: 2, elements: [], appState: {}, files: {} }));
      const renamed = renamePrototype({ key: 'patrick', id: slug, title: 'Beta Roundtrip' });
      assert.equal(renamed.id, 'beta-roundtrip');
      const moved = path.resolve('src/prototypes/patrick', renamed.id);
      assert.match(fs.readFileSync(path.join(moved, 'notes.md'), 'utf8'), /beta-roundtrip/);
      assert.throws(() => renamePrototype({key:'patrick',id:renamed.id,title:'Feedback Inbox'}), /already/);
      const { buildManifest } = await load('scripts/build/build-manifest.js');
      assert.equal(buildManifest().errors, 0);
      const plugin = (await load('scripts/build/vite-files-plugin.js')).default();
      let handler;
      await plugin.configureServer({ middlewares: { use: (_path, fn) => { handler = fn; } }, watcher: { on() {} }, ws: { send() {} }, config: { logger: { error() {} } } });
      const originalRead = fs.readFileSync;
      const readable = path.join(moved, 'prototype.tsx');
      const request = { method: 'GET', url: '/file?contributor=patrick&prototype=beta-roundtrip&path=prototype.tsx', headers: {'sec-fetch-site':'same-origin'} };
      const response = () => ({ statusCode: 0, headersSent: false, setHeader() {}, end(body) { this.body = body; } });
      const failed = response();
      fs.readFileSync = (file, ...args) => { if (file === readable) throw new Error('Simulated read failure'); return originalRead(file, ...args); };
      try { await handler(request, failed, () => assert.fail('Unexpected fallback')); } finally { fs.readFileSync = originalRead; }
      assert.equal(failed.statusCode, 500);
      const recovered = response(); await handler(request, recovered, () => assert.fail('Unexpected fallback'));
      assert.equal(recovered.statusCode, 200);
      // Shared Markdown remains editable even when prototype Documents is absent.
      const { runOp } = await load('scripts/build/files/ops.js');
      runOp(path.resolve('src/handbook/docs'), {op:'create', name:'beta-context.md'}, 'docs');
      assert.match(fs.readFileSync('src/handbook/docs/beta-context.md', 'utf8'), /title: Beta Context/);
      const handbookResponse = response();
      await handler({...request, url:'/file?contributor=handbook&prototype=docs&path=beta-context.md'}, handbookResponse, () => assert.fail('Unexpected fallback'));
      assert.equal(handbookResponse.statusCode, 200);

      fs.mkdirSync('src/systems/z-beta-fixture');
      fs.copyFileSync('src/systems/product/system.ts', 'src/systems/z-beta-fixture/system.ts');
      const metaPath = path.join(moved, 'meta.json');
      const meta = JSON.parse(fs.readFileSync(metaPath)); meta.system = 'z-beta-fixture';
      fs.writeFileSync(metaPath, JSON.stringify(meta));
      const { spawnSync } = await import('node:child_process');
      const removal = spawnSync(process.execPath, ['scripts/cli/studio.js', 'remove', 'z-beta-fixture'], { encoding: 'utf8' });
      assert.equal(removal.status, 1);
      assert.equal((removal.stderr + removal.stdout).includes('patrick/beta-roundtrip'), true, removal.stderr + removal.stdout);
      assert.equal(fs.existsSync('src/systems/z-beta-fixture/system.ts'), true);

    `;
    execFileSync(process.execPath, ['--input-type=module', '--eval', script], { cwd: dir, timeout: 30000, encoding: 'utf8', stdio: 'pipe', env: { ...process.env, MISE_TRUSTED_CONFIG_PATHS: dir } });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('CI accepts reviewed platform proposals and maintainer pushes, rejecting other platform pushes', async () => {
  const { execFileSync, spawnSync } = await import('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-ci-'));
  try {
    const root = path.resolve('.');
    fs.cpSync(root, dir, { recursive: true, filter: (file) => !['node_modules', 'dist', '.git'].includes(path.basename(file)) });
    const runGit = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: 'pipe' }).trim();
    runGit('init', '-q');
    runGit('config', 'user.name', 'Test Maintainer');
    runGit('config', 'user.email', 'test@example.test');
    runGit('config', 'core.hooksPath', '/dev/null');
    runGit('add', 'contributors.json', 'README.md');
    runGit('commit', '-qm', 'Initial fixture');
    const base = runGit('rev-parse', 'HEAD');
    fs.appendFileSync(path.join(dir, 'README.md'), '\nPlatform fixture\n');
    runGit('add', 'README.md'); runGit('commit', '-qm', 'Platform fixture');
    const head = runGit('rev-parse', 'HEAD');
    const github = JSON.parse(fs.readFileSync(path.join(dir, 'contributors.json'))).patrick.github;
    for (const [role, review, expected] of [['write', false, 1], ['maintain', false, 0], ['admin', false, 0], ['write', true, 0]]) {
      const result = spawnSync(process.execPath, ['scripts/check/check-scope.js', '--ci', base, head, ...(review ? ['--review'] : [])], { cwd: dir, encoding: 'utf8', env: { ...process.env, STUDIO_SCOPE_ACTOR: github, STUDIO_PLATFORM_ROLE: role, MISE_TRUSTED_CONFIG_PATHS: dir } });
      assert.equal(result.status, expected, result.stderr + result.stdout);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('Guide source access edits chapters and module READMEs without opening arbitrary files', { skip: !fs.existsSync('src/platform/modules/documentation/server.ts') }, async () => {
  const { execFileSync } = await import('node:child_process');
  const root = path.resolve('.');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-documentation-source-'));
  try {
    fs.cpSync(root, dir, { recursive: true, filter: file => !['.git', 'node_modules', 'dist'].includes(path.basename(file)) });
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'));
    // This fixture exercises the enabled editor even when the parent verifies
    // a disabled Documentation module.
    const config = path.join(dir, 'studio.config.ts');
    fs.writeFileSync(config, fs.readFileSync(config, 'utf8').replace(/\bdocumentation:\s*false/g, 'documentation: true'));
    execFileSync(process.execPath, ['--input-type=module', '--eval', `
      import fs from 'node:fs'; import path from 'node:path'; import assert from 'node:assert/strict';
      const {default:routes}=await import('./src/platform/modules/'+'documentation/server.ts');
      const read=slug=>routes.read({me:null,body:{slug}});
      const write=(slug,content,base)=>routes.write({me:null,body:{slug,content,base}});
      for(const slug of ['index','prototypes']) {
        const before=read(slug); assert.equal(before.status,undefined);
        assert.match(before.body.path, slug==='index' ? /documentation\\/pages\\/index.md$/ : /prototypes\\/README.md$/);
        const content=before.body.content+'\\nGuide editor check.\\n';
        assert.equal(write(slug,content,before.body.version).status,undefined);
        assert.equal(read(slug).body.content,content);
        assert.equal(write(slug,'stale',before.body.version).status,409);
        assert.equal(write(slug,'x'.repeat(750*1024+1),read(slug).body.version).status,413);
      }
      for(const slug of ['../index','../../README','/etc/passwd','index.md','missing']) assert.equal(read(slug).status,404);
      assert.equal(routes.read({me:null,body:null}).status,400);
      const index='src/platform/modules/documentation/pages/index.md';
      fs.unlinkSync(index); fs.symlinkSync(path.resolve('README.md'),index);
      assert.equal(read('index').status,404);
      fs.unlinkSync(index); fs.writeFileSync(index,'---\\ntitle: broken');
      assert.equal(read('index').body.content,'---\\ntitle: broken');
    `], { cwd: dir, encoding: 'utf8', stdio: 'pipe', env: { ...process.env, MISE_TRUSTED_CONFIG_PATHS: dir } });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('documentation source operations allow indexed files and protect against stale writes and symlinks', async () => {
  const { documentationFile } = await import('../build/files/documentation.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-documentation-'));
  try {
    const relative = 'src/platform/core/contract.md';
    const file = path.join(dir, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '# Contract');
    const call = (request, allowed = [relative]) => documentationFile(dir, allowed, request);
    const before = call({ action: 'read', path: relative });
    assert.equal(before.body.content, '# Contract');
    assert.equal(call({ action: 'read', path: '../../README.md' }).status, 404);
    assert.equal(call({ action: 'read', path: relative }, []).status, 404);
    assert.equal(call({ action: 'delete', path: relative }).status, 400);
    assert.equal(call({ action: 'reveal', path: relative }).reveal, file);
    fs.writeFileSync(file, '# External edit');
    assert.equal(call({ action: 'write', path: relative, content: '# Overwrite', base: before.body.version }).status, 409);
    assert.equal(fs.readFileSync(file, 'utf8'), '# External edit');
    const current = call({ action: 'read', path: relative });
    assert.equal(call({ action: 'write', path: relative, content: '# Accepted', base: current.body.version }).status, undefined);
    assert.equal(fs.readFileSync(file, 'utf8'), '# Accepted');
    assert.equal(call({ action: 'write', path: relative, content: 'x'.repeat(750 * 1024 + 1) }).status, 413);
    fs.unlinkSync(file); fs.symlinkSync(path.join(dir, 'other.md'), file);
    assert.equal(call({ action: 'read', path: relative }).status, 404);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('standalone diagrams are discovered by both extensions and disabling preserves Markdown', { skip: !fs.existsSync('src/platform/modules/diagrams/type.ts') }, async () => {
  const { execFileSync } = await import('node:child_process');
  const root = path.resolve('.');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-diagrams-'));
  try {
    fs.cpSync(root, dir, { recursive: true, filter: file => !['.git', 'node_modules', 'dist'].includes(path.basename(file)) });
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'));
    execFileSync(process.execPath, ['--input-type=module', '--eval', `
      import fs from 'node:fs'; import assert from 'node:assert/strict';
      import { editModulesFlag } from './src/platform/core/modules/pack.ts';
      const config='studio.config.ts';
      fs.writeFileSync(config, editModulesFlag(fs.readFileSync(config,'utf8'), 'diagrams', true));
      const folder='src/prototypes/patrick/feedback-inbox';
      fs.writeFileSync(folder+'/test-flow.mermaid','flowchart LR\\n  a --> b');
      fs.writeFileSync(folder+'/test-sequence.mmd','sequenceDiagram\\n  Alice->>Bob: Hello');
      fs.writeFileSync(folder+'/_helper.mermaid','flowchart LR\\n  a --> b');
      fs.writeFileSync(folder+'/test-invalid.mermaid','this is intentionally invalid');
      const { buildManifest } = await import('./scripts/build/build-manifest.js');
      const { manifest, errors } = buildManifest({write:false,quiet:true});
      assert.equal(errors,0);
      const prototype=manifest.prototypes.find(p=>p.contributorKey==='patrick'&&p.id==='feedback-inbox');
      for(const name of ['test-flow.mermaid','test-sequence.mmd','test-invalid.mermaid']) assert.equal(prototype.items.find(i=>i.path===name)?.fileType,'diagrams');
      assert.equal(prototype.items.some(i=>i.path==='_helper.mermaid'),false);
      assert.ok(prototype.items.some(i=>i.fileType==='document'));
      assert.ok(manifest.platformReferences.find(g=>g.id==='diagrams')?.references.length);
      fs.writeFileSync(config,editModulesFlag(fs.readFileSync(config,'utf8'),'diagrams',false));
    `], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
    // A fresh process observes the changed module configuration.
    execFileSync(process.execPath, ['--input-type=module', '--eval', `
      import fs from 'node:fs'; import assert from 'node:assert/strict';
      import {buildManifest} from './scripts/build/build-manifest.js';
      const {manifest,errors}=buildManifest({write:false,quiet:true}); assert.equal(errors,0);
      const prototype=manifest.prototypes.find(p=>p.contributorKey==='patrick'&&p.id==='feedback-inbox');
      assert.equal(prototype.items.some(i=>i.fileType==='diagrams'),false);
      assert.ok(prototype.items.some(i=>i.fileType==='document'));
      assert.ok(fs.existsSync('src/prototypes/patrick/feedback-inbox/test-flow.mermaid'));
      assert.equal(manifest.platformReferences.find(g=>g.id==='diagrams')?.references.length,0);
    `], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
