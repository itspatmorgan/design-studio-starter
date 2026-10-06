import assert from 'node:assert/strict';
import { test } from 'node:test';
import { complete, isComplete, progressKey } from './progress.ts';

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
