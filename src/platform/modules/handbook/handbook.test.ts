// The Handbook's fixed shape: the Agent Skills rules (skills.ts) and the folder check
// (src/platform/modules/handbook/node/handbook-check.js). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { descriptionProblem, nameProblem, skillProblems } from './skills.ts';
import { creatableIn, opProblem } from './rules.ts';
import { handbookMap } from './map.ts';
import { handbookProblems } from './node/handbook-check.js';
import { frontmatter } from '../../../../scripts/lib/frontmatter.js';

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

test('frontmatter reads quoted strings the way YAML does', () => {
  const fm = frontmatter('---\na: "say \\"hi\\": ok"\nb: \'it\'\'s fine\'\nc: "plain"\nd: "broken\\q"\n---') as Record<string, unknown> | null;
  assert.equal(fm?.a, 'say "hi": ok');
  assert.equal(fm?.b, "it's fine");
  assert.equal(fm?.c, 'plain');
  assert.equal(typeof fm?.d, 'string');
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

test('what can be made where', () => {
  assert.deepEqual(creatableIn('docs', ''), ['document', 'folder']);
  assert.deepEqual(creatableIn('docs', 'research'), ['document', 'folder']);
  assert.deepEqual(creatableIn('rules', ''), ['document', 'folder']);
  assert.deepEqual(creatableIn('skills', ''), ['skill']);
  assert.deepEqual(creatableIn('skills', 'review'), ['file', 'folder']);
  assert.deepEqual(creatableIn('skills', 'review/scripts'), ['file', 'folder']);
});

test('changes stay inside the Handbook\'s shape', () => {
  // Docs and rules: Markdown, in folders.
  assert.equal(opProblem('docs', { op: 'create', path: '', name: 'a.md' }, true), null);
  assert.match(opProblem('docs', { op: 'create', path: '', name: 'a.png' }, true) ?? '', /Markdown/);
  assert.equal(opProblem('rules', { op: 'create', path: 'x', name: 'y', dir: true }, true), null);
  assert.match(opProblem('docs', { op: 'rename', path: 'a.md', name: 'a.txt' }, false) ?? '', /Markdown/);
  assert.equal(opProblem('docs', { op: 'move', path: 'a.md', to: 'research' }, false), null);
  assert.equal(opProblem('docs', { op: 'delete', path: 'a.md' }, false), null);
  // Skills: only skill folders at the top, anything inside one.
  assert.match(opProblem('skills', { op: 'create', path: '', name: 'x.md' }, true) ?? '', /New skill/);
  assert.match(opProblem('skills', { op: 'create', path: '', name: 'x', dir: true }, true) ?? '', /New skill/);
  assert.equal(opProblem('skills', { op: 'create', path: 'review', name: 'run.sh' }, true), null);
  assert.equal(opProblem('skills', { op: 'create', path: 'review', name: 'scripts', dir: true }, true), null);
  assert.equal(opProblem('skills', { op: 'rename', path: 'review', name: 'critique' }, true), null);
  assert.match(opProblem('skills', { op: 'rename', path: 'review', name: 'Critique' }, true) ?? '', /skill's name/);
  assert.equal(opProblem('skills', { op: 'delete', path: 'review' }, true), null);
  assert.match(opProblem('skills', { op: 'move', path: 'review', to: 'other' }, true) ?? '', /stays in skills/);
  assert.match(opProblem('skills', { op: 'move', path: 'review/run.sh', to: '' }, false) ?? '', /inside a skill/);
  assert.equal(opProblem('skills', { op: 'move', path: 'review/run.sh', to: 'other' }, false), null);
  // SKILL.md is what makes the skill a skill.
  for (const op of ['rename', 'move', 'delete']) assert.notEqual(opProblem('skills', { op, path: 'review/SKILL.md', name: 'x', to: 'y' }, false), null, op);
  assert.equal(opProblem('skills', { op: 'rename', path: 'review/notes/SKILL.md', name: 'x' }, false), null);
  assert.notEqual(opProblem('docs', { op: 'meta' }, false), null);
});

test('the map: what an agent reads, in order, from the real files', () => {
  const agents = [
    '# Starter',
    "If `node_modules/` doesn't exist, or the person is new, follow [setup](src/handbook/skills/setup/SKILL.md) first.",
    '',
    'At the start of every session, read:',
    '- [systems](src/handbook/rules/systems.md)',
    '- [workflow](src/handbook/rules/workflow.md)',
    '',
    'When the person asks for a canvas (a page of views), read [canvases](src/handbook/rules/canvases.md).',
    'Also see [gone](src/handbook/rules/gone.md) and [nope](src/handbook/skills/nope/SKILL.md).',
  ].join('\n');
  const map = handbookMap({
    agents,
    rules: { 'systems.md': '# Systems', 'workflow.md': 'See [the canvas rule](canvases.md) and [scope](sub/scope.md).', 'canvases.md': '# C', 'sub/scope.md': 'Back to [systems](../systems.md).', 'orphan.md': '# Nobody links here' },
    skills: [{ folder: 'setup', name: 'setup', description: 'Sets up.' }, { folder: 'review', name: 'review', description: 'Reviews.' }],
  });
  assert.deepEqual(map.always, ['systems.md', 'workflow.md']);
  assert.deepEqual(map.onDemand, [{ path: 'canvases.md', when: 'the person asks for a canvas (a page of views)' }]);
  assert.deepEqual(map.via, [{ path: 'sub/scope.md', from: 'workflow.md' }]);
  assert.deepEqual(map.unrouted, ['orphan.md']);
  assert.deepEqual(map.missing, ['src/handbook/rules/gone.md', 'src/handbook/skills/nope/SKILL.md']);
  assert.equal(map.skills.find((s) => s.folder === 'setup')?.when, "`node_modules/` doesn't exist, or the person is new".replace(/`/g, ''));
  assert.equal(map.skills.find((s) => s.folder === 'review')?.when, undefined);
  assert.equal(map.entry, true);
  assert.equal(handbookMap({ agents: null, rules: { 'a.md': '' }, skills: [] }).entry, false);
  assert.deepEqual(handbookMap({ agents: null, rules: { 'a.md': '' }, skills: [] }).unrouted, ['a.md']);
});
