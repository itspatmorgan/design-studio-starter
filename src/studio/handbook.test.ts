// The Handbook's fixed shape: the Agent Skills rules (skills.ts) and the folder check
// (scripts/lib/handbook-check.js). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { descriptionProblem, nameProblem, skillProblems } from './skills.ts';
import { handbookProblems } from '../../scripts/lib/handbook-check.js';
import { frontmatter } from '../../scripts/lib/frontmatter.js';

test('skill names follow the spec', () => {
  for (const ok of ['pdf-processing', 'a', 'code-review-2', 'x'.repeat(64)]) assert.equal(nameProblem(ok), null, ok);
  for (const bad of ['PDF-Processing', '-pdf', 'pdf-', 'pdf--processing', 'pdf processing', 'pdf_processing', '', 'x'.repeat(65)]) {
    assert.notEqual(nameProblem(bad), null, bad);
  }
});

test('descriptions are required and at most 1024 characters', () => {
  assert.equal(descriptionProblem('Does a thing. Use when asked.'), null);
  assert.notEqual(descriptionProblem(''), null);
  assert.notEqual(descriptionProblem('   '), null);
  assert.notEqual(descriptionProblem('x'.repeat(1025)), null);
});

test('a skill needs frontmatter whose name matches its folder', () => {
  assert.deepEqual(skillProblems('review', { name: 'review', description: 'Reviews. Use when asked.' }), []);
  assert.equal(skillProblems('review', null).length, 1);
  assert.match(skillProblems('review', { name: 'other', description: 'd' })[0], /have to match/);
  assert.match(skillProblems('review', { description: 'd' })[0], /is missing/);
  assert.match(skillProblems('review', { name: 'review' })[0], /is missing/);
  assert.equal(skillProblems('review', { name: 'review', description: 'd', compatibility: 'x'.repeat(501) }).length, 1);
});

test('frontmatter reads block descriptions and ignores nested maps', () => {
  const fm = frontmatter('---\nname: a\ndescription: >\n  First line\n  second line.\nmetadata:\n  author: me\nallowed-tools: Read\n---\nBody') as Record<string, unknown> | null;
  assert.equal(fm?.description, 'First line second line.');
  assert.equal(fm?.['allowed-tools'], 'Read');
  assert.equal(fm?.author, undefined);
});

// A Handbook in a temporary folder, from { 'docs/a.md': text, ... }.
function handbook(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'handbook-'));
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  }
  return root;
}
const skill = (name: string) => `---\nname: ${name}\ndescription: Does a thing. Use when asked.\n---\n\nBody\n`;

test('a well-formed Handbook has no problems', () => {
  const root = handbook({ 'docs/a.md': '# A', 'docs/research/b.md': '# B', 'rules/r.md': '# R', 'skills/review/SKILL.md': skill('review'), 'skills/review/scripts/run.sh': 'echo', 'skills/review/references/x.md': '# X' });
  assert.deepEqual(handbookProblems(root), []);
});

test('the top level is docs, rules, and skills only', () => {
  const root = handbook({ 'docs/a.md': '# A', 'notes/n.md': '# N', 'loose.md': '# L' });
  const problems = handbookProblems(root);
  assert.equal(problems.length, 2);
  assert.match(problems.join('\n'), /notes\/ isn't part of the Handbook's structure/);
  assert.match(problems.join('\n'), /loose\.md/);
});

test('docs and rules hold Markdown only, and skills hold skill folders', () => {
  const root = handbook({ 'docs/a.md': '# A', 'docs/pic.png': 'x', 'rules/r.txt': 'x', 'skills/loose.md': '# L', 'skills/empty/notes.md': '# N', 'skills/bad/SKILL.md': skill('other') });
  const text = handbookProblems(root).join('\n');
  assert.match(text, /docs\/pic\.png isn't a Markdown file/);
  assert.match(text, /rules\/r\.txt isn't a Markdown file/);
  assert.match(text, /skills\/loose\.md is loose/);
  assert.match(text, /skills\/empty\/ has no SKILL\.md/);
  assert.match(text, /have to match/);
});
