import assert from 'node:assert/strict';
import { test } from 'node:test';
import { complete, isComplete, progressKey } from './progress.ts';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { claimWelcome } from './node/progress.js';
import server from './server.ts';
import { claimIntroduction, recordIntroduction } from './progress.ts';
import { welcomeOnlyChange } from '../../../scripts/build/vite-settings-plugin.js';

const configFile = (root: string) => path.join(root, 'studio.config.ts');
const freshConfig = (root: string) => fs.writeFileSync(configFile(root), "// Keep this comment\nexport default { name: 'My studio', modules: { onboarding: true }, welcomeDismissed: false };\n");

test('onboarding completion persists and does not cross base paths', () => {
  const data = new Map<string, string>();
  const storage = () => ({ getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) });
  const key = progressKey('/studio-test/');
  assert.equal(isComplete(key, storage), false);
  assert.equal(complete(key, storage), true);
  assert.equal(data.get(key), 'complete');
  assert.equal(isComplete(progressKey('/other-studio/'), storage), false);
});

test('persisted completion is recognized without completing again', () => {
  assert.equal(isComplete(progressKey('/returning/'), () => ({ getItem: () => 'complete', setItem: () => assert.fail() })), true);
});

test('blocked storage still allows the person to leave Welcome for this session', () => {
  const unavailable = () => { throw new Error('Storage blocked'); };
  const key = progressKey('/blocked/');
  assert.equal(isComplete(key, unavailable), false);
  assert.equal(complete(key, unavailable), false);
  assert.equal(isComplete(key, unavailable), true);
});

test('first display persists across restart and origins while studios remain independent', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-welcome-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  freshConfig(root);
  assert.equal(claimWelcome(root), true);
  assert.match(fs.readFileSync(configFile(root), 'utf8'), /welcomeDismissed: true/);
  assert.match(fs.readFileSync(configFile(root), 'utf8'), /Keep this comment/);
  assert.match(fs.readFileSync(configFile(root), 'utf8'), /name: 'My studio'/);
  assert.equal(fs.existsSync(path.join(root, '.design-studio-welcome-dismissed')), false);
  // Restarting or changing browser origin doesn't change the config flag.
  assert.equal(claimWelcome(root), false);
  const other = path.join(root, 'another-studio');
  fs.mkdirSync(other);
  freshConfig(other);
  assert.equal(claimWelcome(other), true);
  assert.equal(claimWelcome(other), false);
});

test('Welcome marker cannot follow a link or overwrite an existing file', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-welcome-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  freshConfig(root);
  const target = path.join(root, 'keep.txt');
  fs.writeFileSync(target, 'keep');
  const marker = path.join(root, '.design-studio-welcome-dismissed');
  fs.symlinkSync(target, marker);
  assert.throws(() => claimWelcome(root), /empty ordinary file/);
  assert.equal(fs.readFileSync(target, 'utf8'), 'keep');
});

test('the old empty marker migrates into config without reopening Welcome', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-welcome-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  freshConfig(root);
  const marker = path.join(root, '.design-studio-welcome-dismissed');
  fs.writeFileSync(marker, '');
  assert.equal(claimWelcome(root), false);
  assert.match(fs.readFileSync(configFile(root), 'utf8'), /welcomeDismissed: true/);
  assert.equal(fs.existsSync(marker), false);
});

test('Welcome never follows a config symlink or overwrites invalid configuration', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-welcome-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const target = path.join(root, 'keep.ts');
  fs.writeFileSync(target, 'export default { welcomeDismissed: false };');
  fs.symlinkSync(target, configFile(root));
  assert.throws(() => claimWelcome(root), /ordinary file/);
  assert.equal(fs.readFileSync(target, 'utf8'), 'export default { welcomeDismissed: false };');
  fs.unlinkSync(configFile(root));
  fs.writeFileSync(configFile(root), 'export default { welcomeDismissed: "yes" };');
  assert.throws(() => claimWelcome(root), /true or false/);
  assert.equal(fs.readFileSync(configFile(root), 'utf8'), 'export default { welcomeDismissed: "yes" };');
});

test('only Welcome progress avoids a config restart; other and invalid changes do not', () => {
  const before = "export default { name: 'Studio', modules: { onboarding: true } };";
  const dismissed = "export default { name: 'Studio', modules: { onboarding: true }, welcomeDismissed: true };";
  assert.equal(welcomeOnlyChange(before, dismissed), true);
  assert.equal(welcomeOnlyChange(dismissed, before), true);
  assert.equal(welcomeOnlyChange(before, dismissed.replace("'Studio'", "'Renamed'")), false);
  assert.equal(welcomeOnlyChange(before, dismissed.replace('onboarding: true', 'onboarding: false')), false);
  assert.equal(welcomeOnlyChange(before, 'export default computed();'), false);
  assert.equal(welcomeOnlyChange(before, dismissed.replace('welcomeDismissed: true', 'welcomeDismissed: 1')), false);
});

test('Welcome route rejects arbitrary paths and unsupported actions', async () => {
  for (const body of [null, [], { action: 'delete' }, { action: 'claim', path: '/tmp/elsewhere' }]) {
    assert.equal((await server.progress({ me: null, body })).status, 400);
  }
});

test('effect replay shares one claim and returning after display cannot reopen it', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls += 1; return new Response(JSON.stringify({ show: true })); });
  const key = progressKey('/effect-replay/');
  const first = claimIntroduction(key);
  assert.equal(claimIntroduction(key), first);
  assert.equal(await first, true);
  recordIntroduction(key);
  assert.equal(await claimIntroduction(key), false);
  assert.equal(calls, 1);
});
