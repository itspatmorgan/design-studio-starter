import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { packageStarter } from './starter-package.mjs';

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'studio-package-')));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const files = ['src/platform/skills/review/SKILL.md', '.agents/skills/review/SKILL.md',
    'studio.config.ts', 'contributors.json', 'contributors/sam.json', 'scripts/cli/studio.js', '.agents/studio-skills.json', 'patches/fix.patch',
    'plugins/design-studio/plugin.json', '.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json',
    '.cursor-plugin/marketplace.json', 'scripts/eval/results.json', '.github/workflows/check.yml'];
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), 'preserved content');
  }
  fs.mkdirSync(path.join(root, '.claude/skills'), { recursive: true });
  fs.symlinkSync('../../.agents/skills/review', path.join(root, '.claude/skills/review'));
  files.push('.claude/skills/review');
  return { root, files };
}

test('starter retains working code and linked skills while omitting distribution and evaluations', t => {
  const { root, files } = fixture(t);
  packageStarter(root, files);
  for (const file of ['studio.config.ts', 'contributors.json', 'contributors/sam.json', 'scripts/cli/studio.js', 'patches/fix.patch', 'src/platform/skills/review/SKILL.md']) {
    assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), 'preserved content');
  }
  assert.equal(fs.readFileSync(path.join(root, '.claude/skills/review/SKILL.md'), 'utf8'), 'preserved content');
  for (const file of ['plugins', '.agents/plugins', '.claude-plugin', '.cursor-plugin', '.github', 'scripts/eval']) assert.ok(!fs.existsSync(path.join(root, file)));
  assert.match(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /Your studio and all its source files live locally/);
});

test('invalid paths and links fail before package contents are removed', t => {
  const { root, files } = fixture(t);
  assert.throws(() => packageStarter(root, [...files, '../outside']), /Unsafe/);
  fs.symlinkSync('../../../plugins/design-studio', path.join(root, '.agents/skills/distribution'));
  assert.throws(() => packageStarter(root, [...files, '.agents/skills/distribution']), /leaves selected/);
  assert.ok(fs.existsSync(path.join(root, 'plugins/design-studio/plugin.json')));
  assert.equal(fs.readFileSync(path.join(root, 'studio.config.ts'), 'utf8'), 'preserved content');
});

test('working builds keep source checks and expose full release validation separately', t => {
  const { root, files } = fixture(t);
  const build = 'node scripts/build/build-manifest.js --strict --deploy && node scripts/check/check-modules.js && pnpm test && pnpm typecheck && vite build';
  const pkg = { scripts: { build, test: 'node scripts/check/test.js', dev: 'vite' }, dependencies: { react: '19' } };
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg));
  packageStarter(root, [...files, 'package.json']);
  const packed = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
  assert.equal(packed.scripts['build:release'], build);
  assert.equal(packed.scripts.build, 'node scripts/build/build-manifest.js --strict --deploy && node scripts/check/check-modules.js && pnpm typecheck && vite build');
  assert.equal(packed.scripts.test, pkg.scripts.test);
  assert.deepEqual(packed.dependencies, pkg.dependencies);
});
