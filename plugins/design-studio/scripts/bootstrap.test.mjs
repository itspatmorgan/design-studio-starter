import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { createStudio, chooseStudioLocation, destinationPath, inspectStudio, checkInitialConfiguration, ensureClaudeEntry, RECEIPT } from './bootstrap.mjs';

function fixture(t) {
  const temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'studio-plugin-test-')));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const source = path.join(temp, 'source');
  fs.mkdirSync(path.join(source, 'src/systems/studio'), { recursive: true });
  for (const file of ['AGENTS.md', 'pnpm-lock.yaml', 'mise.toml', 'studio.config.ts', 'src/systems/studio/AGENTS.md']) fs.writeFileSync(path.join(source, file), 'fixture');
  fs.writeFileSync(path.join(source, 'package.json'), JSON.stringify({ name: 'design-studio-starter', scripts: { dev: 'vite' } }));
  const git = (...args) => execFileSync('git', args, { cwd: source, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '--initial-branch=main');
  git('add', '.');
  git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', '-c', 'core.hooksPath=/dev/null', 'commit', '-m', 'Fixture');
  return { temp, source, revision: git('rev-parse', 'HEAD'), destination: path.join(temp, 'My studio; literal $name') };
}

test('creates packaged visible source from pinned commit without an upstream remote', (t) => {
  const options = fixture(t);
  const result = createStudio({ ...options, name: 'My studio' });
  assert.equal(result.existing, false);
  assert.equal(result.revision, options.revision);
  assert.match(execFileSync('git', ['log', '-1', '--format=%s'], { cwd: options.destination, encoding: 'utf8' }), new RegExp(options.revision));
  assert.equal(execFileSync('git', ['status', '--porcelain'], { cwd: options.destination, encoding: 'utf8' }).trim(), '');
  assert.equal(execFileSync('git', ['remote'], { cwd: options.destination, encoding: 'utf8' }).trim(), '');
  assert.ok(fs.existsSync(path.join(options.destination, 'src/systems/studio/AGENTS.md')));
  assert.equal(inspectStudio(options.destination).name, 'My studio');
});

test('repeat setup preserves source and configuration edits', (t) => {
  const options = fixture(t);
  createStudio(options);
  const file = path.join(options.destination, 'studio.config.ts');
  fs.writeFileSync(file, 'my configuration');
  assert.equal(createStudio({ ...options, name: 'Replacement' }).existing, true);
  assert.equal(fs.readFileSync(file, 'utf8'), 'my configuration');
  assert.equal(inspectStudio(options.destination).name, 'Design Studio');
});

test('additional studios are numbered while existing names and edits survive', (t) => {
  const options = fixture(t);
  const parent = path.join(options.temp, 'Developer');
  for (const name of ['Design Studio', 'Design Studio 2', 'Design Studio 3']) {
    const chosen = chooseStudioLocation({ parent });
    assert.equal(chosen.name, name);
    assert.equal(chosen.destination, path.join(parent, name));
    assert.equal(createStudio({ ...options, ...chosen }).name, name);
    fs.writeFileSync(path.join(chosen.destination, 'studio.config.ts'), `custom ${name}`);
  }
  const first = path.join(parent, 'Design Studio');
  const receiptPath = path.join(first, RECEIPT);
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  fs.writeFileSync(receiptPath, JSON.stringify({ ...receipt, name: 'Acme Studio' }));
  assert.equal(createStudio({ ...options, destination: first }).name, 'Acme Studio');
  assert.equal(fs.readFileSync(path.join(first, 'studio.config.ts'), 'utf8'), 'custom Design Studio');
  assert.equal(chooseStudioLocation({ parent }).name, 'Design Studio 4');
});

test('selection skips unrelated folders and dangling links without writing', (t) => {
  const options = fixture(t);
  const parent = path.join(options.temp, 'Developer');
  assert.equal(chooseStudioLocation({ parent }).name, 'Design Studio');
  assert.equal(fs.existsSync(parent), false);
  fs.mkdirSync(path.join(parent, 'Design Studio'), { recursive: true });
  fs.writeFileSync(path.join(parent, 'Design Studio', 'important.txt'), 'keep');
  fs.symlinkSync(path.join(options.temp, 'missing'), path.join(parent, 'Design Studio 2'));
  const output = execFileSync(process.execPath, [path.resolve('plugins/design-studio/scripts/bootstrap.mjs'), 'choose', '--parent', parent], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(output), { name: 'Design Studio 3', destination: path.join(parent, 'Design Studio 3') });
  assert.deepEqual(fs.readdirSync(parent), ['Design Studio', 'Design Studio 2']);
  assert.equal(fs.readFileSync(path.join(parent, 'Design Studio', 'important.txt'), 'utf8'), 'keep');
  assert.throws(() => chooseStudioLocation({ parent: 'relative' }), /absolute/);
});

test('refuses unrelated existing folders and preserves their files', (t) => {
  const options = fixture(t);
  fs.mkdirSync(options.destination);
  fs.writeFileSync(path.join(options.destination, 'important.txt'), 'keep');
  assert.throws(() => createStudio(options));
  assert.equal(fs.readFileSync(path.join(options.destination, 'important.txt'), 'utf8'), 'keep');
});

test('refuses cache paths, relative paths, linked destinations and parents', (t) => {
  const options = fixture(t);
  assert.throws(() => destinationPath('relative/studio'));
  assert.throws(() => destinationPath('/Users/designer/.codex/plugins/studio'));
  assert.throws(() => destinationPath('/Users/designer/.claude/plugins/studio'));
  assert.throws(() => destinationPath('/Users/designer/.cursor/plugins/studio'));
  const linked = path.join(options.temp, 'linked');
  fs.symlinkSync(options.source, linked);
  assert.throws(() => createStudio({ ...options, destination: linked }));
  assert.throws(() => createStudio({ ...options, destination: path.join(linked, 'new-studio') }));
});

test('Claude entry imports shared instructions and preserves custom entries', (t) => {
  const options = fixture(t);
  createStudio(options);
  ensureClaudeEntry(options.destination);
  const entry = path.join(options.destination, 'CLAUDE.md');
  assert.equal(fs.readFileSync(entry, 'utf8'), '@AGENTS.md\n');
  fs.writeFileSync(entry, '# Design Studio\n\nRead and follow [repository instructions](AGENTS.md) before work. Project skills route to their canonical sources.\n');
  ensureClaudeEntry(options.destination);
  assert.equal(fs.readFileSync(entry, 'utf8'), '@AGENTS.md\n');
  fs.writeFileSync(entry, 'Personal instructions\n@AGENTS.md\n');
  ensureClaudeEntry(options.destination);
  assert.equal(fs.readFileSync(entry, 'utf8'), 'Personal instructions\n@AGENTS.md\n');
});

test('failed fetch leaves no destination or staging folder', (t) => {
  const options = fixture(t);
  assert.throws(() => createStudio({ ...options, revision: 'f'.repeat(40) }));
  assert.equal(fs.existsSync(options.destination), false);
  assert.deepEqual(fs.readdirSync(options.temp), ['source']);
});

test('invalid or linked receipt cannot resume setup', (t) => {
  const options = fixture(t);
  createStudio(options);
  const receipt = path.join(options.destination, RECEIPT);
  fs.writeFileSync(receipt, '{}');
  assert.throws(() => inspectStudio(options.destination));
  fs.unlinkSync(receipt);
  fs.symlinkSync(path.join(options.source, 'package.json'), receipt);
  assert.throws(() => inspectStudio(options.destination));
});

test('interrupted setup preserves user settings before applying defaults', (t) => {
  const options = fixture(t);
  createStudio(options);
  const studio = inspectStudio(options.destination);
  checkInitialConfiguration(studio);
  fs.writeFileSync(path.join(options.destination, 'studio.config.ts'), 'user settings');
  assert.throws(() => checkInitialConfiguration(studio), /preserved/);
  assert.equal(fs.readFileSync(path.join(options.destination, 'studio.config.ts'), 'utf8'), 'user settings');
  checkInitialConfiguration({ ...studio, prepared: true });
});

test('refuses linked Git metadata when reopening a studio', (t) => {
  const options = fixture(t);
  createStudio(options);
  const metadata = path.join(options.destination, '.git');
  fs.rmSync(metadata, { recursive: true });
  fs.symlinkSync(path.join(options.source, '.git'), metadata);
  assert.throws(() => inspectStudio(options.destination), /ordinary local Git/);
});
