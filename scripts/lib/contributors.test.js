import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { readContributors } from './contributors.js';
import { writeProfiles } from './fixtures/contributors.js';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-profiles-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test('profiles use filename keys and retain each person’s preferences independently', t => {
  const root = fixture(t);
  writeProfiles(root, { sam: { name: 'Sam', custom: { keep: true } }, alex: { name: 'Alex', welcomeDismissed: true } });
  const result = readContributors(root);
  assert.deepEqual(Object.keys(result.contributors), ['alex', 'sam']);
  assert.deepEqual(result.contributors.sam.custom, { keep: true });
  assert.equal(result.contributors.alex.welcomeDismissed, true);
  assert.deepEqual(result.problems, []);
});

test('profile validation catches missing declarations and ambiguous identities', t => {
  const root = fixture(t);
  writeProfiles(root, { sam: { name: 'Sam', email: 'sam@example.test', github: 'sam' }, alex: { name: 'Alex', email: 'SAM@example.test', github: 'SAM' } });
  assert.equal(readContributors(root).problems.length, 2);
  fs.writeFileSync(path.join(root, 'contributors/alex.json'), JSON.stringify({ name: '', welcomeDismissed: 'yes' }));
  const { problems } = readContributors(root);
  for (const field of ['name', 'email', 'github', 'welcomeDismissed']) assert.ok(problems.some(p => p.includes(field)));
});

test('linked profiles, invalid keys, and non-object profiles are rejected', t => {
  const root = fixture(t);
  writeProfiles(root, { sam: { name: 'Sam' } });
  fs.symlinkSync(path.join(root, 'contributors/sam.json'), path.join(root, 'contributors/alex.json'));
  fs.writeFileSync(path.join(root, 'contributors/Bad.json'), '{}');
  fs.writeFileSync(path.join(root, 'contributors/invalid.json'), '[]');
  const { contributors, problems } = readContributors(root);
  assert.deepEqual(Object.keys(contributors), ['sam']);
  assert.equal(problems.length, 3);
});
