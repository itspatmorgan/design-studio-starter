import assert from 'node:assert/strict';
import { test } from 'node:test';
import { complete, isComplete, progressKey } from './progress.ts';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { claimWelcome } from './node/progress.js';
import server from './server.ts';
import { claimIntroduction, recordIntroduction } from './progress.ts';

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
  assert.equal(claimWelcome(root), true);
  // A restarted process/browser has no in-memory state; the fixed marker is sufficient.
  assert.equal(claimWelcome(root), false);
  const other = path.join(root, 'another-studio');
  fs.mkdirSync(other);
  assert.equal(claimWelcome(other), true);
  assert.equal(claimWelcome(other), false);
});

test('Welcome marker cannot follow a link or overwrite an existing file', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-welcome-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const target = path.join(root, 'keep.txt');
  fs.writeFileSync(target, 'keep');
  const marker = path.join(root, '.design-studio-welcome-dismissed');
  fs.symlinkSync(target, marker);
  assert.throws(() => claimWelcome(root), /ordinary local file/);
  assert.equal(fs.readFileSync(target, 'utf8'), 'keep');
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
