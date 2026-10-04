// The system content's fixed shape: the Agent Skills rules (skills.ts) and the folder check
// (src/platform/modules/systems/content/node/content-check.js). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { descriptionProblem, nameProblem, skillProblems } from './skills.ts';
import { creatableIn, opProblem } from './rules.ts';
import { systemContentMap } from './map.ts';
import { systemContentProblems } from './node/content-check.js';
import { templateFor } from '../../../../../scripts/build/files/ops.js';
import { frontmatter } from '../../../../../scripts/lib/frontmatter.js';

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

// A system content in a temporary folder, from { 'context/a.md': text, ... }.
function systemContent(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'systemContent-'));
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  }
  return root;
}
const skill = (name: string) => `---\nname: ${name}\ndescription: Does a thing. Use when asked.\n---\n\nBody\n`;

test('a well-formed SystemContent has no problems', () => {
  const root = systemContent({ 'context/a.md': '# A', 'context/research/b.md': '# B', 'rules/r.md': '# R', 'skills/review/SKILL.md': skill('review'), 'skills/review/scripts/run.sh': 'echo', 'skills/review/references/x.md': '# X' });
  assert.deepEqual(systemContentProblems(root), []);
});

test('the top level is docs, rules, and skills only', () => {
  const root = systemContent({ 'context/a.md': '# A', 'notes/n.md': '# N', 'loose.md': '# L' });
  const problems = systemContentProblems(root);
  assert.equal(problems.length, 2);
  assert.match(problems.join('\n'), /notes\/ isn't part of the system content structure/);
  assert.match(problems.join('\n'), /loose\.md/);
});

test('docs and rules hold Markdown only, and skills hold skill folders', () => {
  const root = systemContent({ 'context/a.md': '# A', 'context/pic.png': 'x', 'rules/r.txt': 'x', 'skills/loose.md': '# L', 'skills/empty/notes.md': '# N', 'skills/bad/SKILL.md': skill('other') });
  const text = systemContentProblems(root).join('\n');
  assert.match(text, /context\/pic\.png isn't a Markdown file/);
  assert.match(text, /rules\/r\.txt isn't a Markdown file/);
  assert.match(text, /skills\/loose\.md is loose/);
  assert.match(text, /skills\/empty\/ has no SKILL\.md/);
  assert.match(text, /have to match/);
});

test('what can be made where', () => {
  assert.deepEqual(creatableIn('context', ''), ['document', 'folder']);
  assert.deepEqual(creatableIn('context', 'research'), ['document', 'folder']);
  assert.deepEqual(creatableIn('rules', ''), ['document', 'folder']);
  assert.deepEqual(creatableIn('skills', ''), ['skill']);
  assert.deepEqual(creatableIn('skills', 'review'), ['file', 'folder']);
  assert.deepEqual(creatableIn('skills', 'review/scripts'), ['file', 'folder']);
});

test('changes stay inside the SystemContent\'s shape', () => {
  // Docs and rules: Markdown, in folders.
  assert.equal(opProblem('context', { op: 'create', path: '', name: 'a.md' }, true), null);
  assert.match(opProblem('context', { op: 'create', path: '', name: 'a.png' }, true) ?? '', /Markdown/);
  assert.equal(opProblem('rules', { op: 'create', path: 'x', name: 'y', dir: true }, true), null);
  assert.match(opProblem('context', { op: 'rename', path: 'a.md', name: 'a.txt' }, false) ?? '', /Markdown/);
  assert.equal(opProblem('context', { op: 'move', path: 'a.md', to: 'research' }, false), null);
  assert.equal(opProblem('context', { op: 'delete', path: 'a.md' }, false), null);
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
  assert.notEqual(opProblem('context', { op: 'meta' }, false), null);
});

test('the map: what an agent reads, in order, from the real files', () => {
  const agents = [
    '# Starter',
    "If `node_modules/` doesn't exist, or the person is new, follow [setup](src/systems/platform/skills/setup/SKILL.md) first.",
    '',
    'At the start of every session, read:',
    '- [systems](src/systems/platform/rules/systems.md)',
    '- [workflow](src/systems/platform/rules/workflow.md)',
    '',
    'When the person asks for a canvas (a page of views), read [canvases](src/systems/platform/rules/canvases.md).',
    'Also see [gone](src/systems/platform/rules/gone.md) and [nope](src/systems/platform/skills/nope/SKILL.md).',
  ].join('\n');
  const map = systemContentMap({
    agents,
    rules: { 'systems.md': '# Systems', 'workflow.md': 'See [the canvas rule](canvases.md) and [scope](sub/scope.md).', 'canvases.md': '# C', 'sub/scope.md': 'Back to [systems](../systems.md).', 'orphan.md': '# Nobody links here' },
    skills: [{ folder: 'setup', name: 'setup', description: 'Sets up.' }, { folder: 'review', name: 'review', description: 'Reviews.' }],
  });
  assert.deepEqual(map.always, ['systems.md', 'workflow.md']);
  assert.deepEqual(map.onDemand, [{ path: 'canvases.md', when: 'the person asks for a canvas (a page of views)' }]);
  assert.deepEqual(map.via, [{ path: 'sub/scope.md', from: 'workflow.md' }]);
  assert.deepEqual(map.unrouted, ['orphan.md']);
  assert.deepEqual(map.missing, ['src/systems/platform/rules/gone.md', 'src/systems/platform/skills/nope/SKILL.md']);
  assert.equal(map.skills.find((s) => s.folder === 'setup')?.when, "`node_modules/` doesn't exist, or the person is new".replace(/`/g, ''));
  assert.equal(map.skills.find((s) => s.folder === 'review')?.when, undefined);
  assert.equal(map.entry, true);
  assert.equal(systemContentMap({ agents: null, rules: { 'a.md': '' }, skills: [] }).entry, false);
  assert.deepEqual(systemContentMap({ agents: null, rules: { 'a.md': '' }, skills: [] }).unrouted, ['a.md']);
});

test('SystemContent creation uses its own Markdown template', () => {
  assert.match(templateFor('team-context.md', true), /title: Team Context/);
  assert.equal(templateFor('support.js', true), '');
});

test('platform reference discovery preserves ownership and excludes unavailable module content', async () => {
  const { platformReferences } = await import('../../../../../scripts/lib/platform-references.js');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-references-'));
  const write = (file: string, text: string) => { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), text); };
  try {
    write('src/platform/core/fileTypes.md', '# File-type contract');
    write('src/platform/modules/README.md', '# Module contract');
    write('src/platform/modules/example/README.md', '---\ntitle: "Example capability"\n---\n# Example');
    write('src/platform/modules/example/reference.md', '# Example contract');
    write('src/platform/modules/example/internal/notes.md', '# Internal notes');
    write('src/platform/modules/off/README.md', '# Unavailable capability');
    write('src/systems/platform/rules/example.md', '# Example rule\nRead [contract](../../../platform/modules/example/reference.md#details).');
    write('src/systems/platform/skills/example/SKILL.md', '---\nname: example\ndescription: Example task\n---\nRead [reference](../../../../platform/modules/example/README.md).');
    const modules = [{id:'example',label:'Example'}, {id:'off',label:'Off'}];
    const systemContent = [{id:'platform:rules',contributorKey:'system-content',system:'platform',title:'Rules',artifacts:[{path:'example.md'}]}, {id:'platform:skills',contributorKey:'system-content',system:'platform',title:'Skills',artifacts:[{path:'example/SKILL.md'}]}];
    const groups = platformReferences({root,modules,enabled:['example'],systemContent});
    const example = groups.find((g) => g.id === 'example');
    assert.deepEqual(example.references.map((r: { source: string }) => r.source), ['/platform/modules/example/README.md','/platform/modules/example/reference.md']);
    assert.equal(example.references[0].title, 'Example');
    assert.equal(example.references[1].title, 'Example contract');
    assert.deepEqual(example.related.map((r: { href: string }) => r.href), ['/systems/platform/rules/example','/systems/platform/skills/example/SKILL']);
    assert.equal(example.related[1].title, 'platform · Skills · Example');
    assert.deepEqual(groups.find((g) => g.id === 'off').references, []);
    assert.equal(groups.find((g) => g.id === 'off').enabled, false);
    assert.ok(!platformReferences({root,modules:modules.slice(0,1),enabled:['example'],systemContent}).some((g)=>g.id==='off'));
  } finally { fs.rmSync(root, {recursive:true,force:true}); }
});

test('system instruction maps keep identical rule and skill names in their own scopes', () => {
  const rules = { 'accessibility.md': 'Keep labels visible.' };
  const skills = [{ folder: 'review', name: 'review', description: 'Review this product.' }];
  const product = systemContentMap({ root: 'src/systems/product', agents: 'Read [rule](rules/accessibility.md) and [review](skills/review/SKILL.md).', rules, skills });
  const brand = systemContentMap({ root: 'src/systems/brand', agents: 'Read [other](src/systems/product/rules/accessibility.md).', rules, skills });
  assert.deepEqual(product.onDemand.map((r) => r.path), ['accessibility.md']);
  assert.deepEqual(product.missing, []);
  assert.deepEqual(brand.onDemand, []);
  assert.deepEqual(brand.unrouted, ['accessibility.md']);
});
