// How archive status is read from a view's tag and written back (archive.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileStatus, forDeploy, linksToArchived, parseStatus, relativeLinksToArchived, withStatus } from './archive.ts';

const VIEW = `export default function V() { return null; }\n`;

test('a file with no tag is active', () => {
  assert.deepEqual(fileStatus(VIEW), { status: 'active' });
  assert.deepEqual(fileStatus(''), { status: 'active' });
});

test('the tag is read from a comment at the top', () => {
  assert.equal(fileStatus(`/** @status archived */\n${VIEW}`).status, 'archived');
  assert.equal(fileStatus(`// @status archived\n${VIEW}`).status, 'archived');
  assert.equal(fileStatus(`/**\n * Checkout, first try.\n * @status archived\n */\n${VIEW}`).status, 'archived');
  assert.equal(fileStatus(`\uFEFF/** @status archived */\n${VIEW}`).status, 'archived');
});

test('a tag below the code is not read', () => {
  assert.equal(fileStatus(`${VIEW}// @status archived\n`).status, 'active');
  assert.equal(fileStatus(`import x from 'y';\n/** @status archived */\n${VIEW}`).status, 'active');
});

test('an unknown status reads as active, with a problem', () => {
  const { status, problem } = fileStatus(`/** @status done */\n${VIEW}`);
  assert.equal(status, 'active');
  assert.match(problem!, /"done".*active, archived/);
});

test('archiving adds the tag, and unarchiving takes it out again', () => {
  const archived = withStatus(VIEW, 'archived');
  assert.equal(archived, `/** @status archived */\n${VIEW}`);
  assert.equal(withStatus(archived, 'active'), VIEW);
});

test('archiving twice changes nothing more', () => {
  const once = withStatus(VIEW, 'archived');
  assert.equal(withStatus(once, 'archived'), once);
  assert.equal(withStatus(VIEW, 'active'), VIEW);
});

test('a tag inside a longer comment is removed alone', () => {
  const source = `/**\n * Checkout, first try.\n * @status archived\n */\n${VIEW}`;
  const active = withStatus(source, 'active');
  assert.equal(fileStatus(active).status, 'active');
  assert.match(active, /Checkout, first try\./);
  assert.ok(active.endsWith(VIEW));
});

test('a changed tag keeps the rest of the file', () => {
  const source = `// @status done\n${VIEW}`;
  assert.equal(withStatus(source, 'archived'), `// @status archived\n${VIEW}`);
});

test('the byte order mark stays first', () => {
  const archived = withStatus(`\uFEFF${VIEW}`, 'archived');
  assert.ok(archived.startsWith('\uFEFF/** @status archived */'));
  assert.equal(withStatus(archived, 'active'), `\uFEFF${VIEW}`);
});

test('parseStatus accepts only statuses', () => {
  assert.equal(parseStatus('archived'), 'archived');
  assert.equal(parseStatus('active'), 'active');
  assert.equal(parseStatus('done'), null);
  assert.equal(parseStatus(undefined), null);
  assert.equal(parseStatus(3), null);
});

const proto = (id: string, items: { path: string; status?: 'archived' }[], extra: object = {}) =>
  ({ id, contributorKey: 'patrick', items, start: null, ...extra });

test('a deploy keeps active prototypes and views as they are', () => {
  const p = proto('a', [{ path: 'one.tsx' }, { path: 'two.tsx' }], { start: 'two.tsx' });
  const { kept, archived, leftOut } = forDeploy([p]);
  assert.deepEqual(kept, [p]);
  assert.deepEqual(archived, []);
  assert.deepEqual(leftOut, { prototypes: 0, views: 0 });
});

test('a deploy leaves out an archived prototype whole', () => {
  const { kept, archived, leftOut } = forDeploy([proto('old', [{ path: 'one.tsx' }], { status: 'archived' }), proto('new', [{ path: 'one.tsx' }])]);
  assert.deepEqual(kept.map((p) => p.id), ['new']);
  assert.deepEqual(archived, ['/prototypes/patrick/old/**']);
  assert.deepEqual(leftOut, { prototypes: 1, views: 0 });
});

test('a deploy leaves out archived views, and opens on the first view left if the start is archived', () => {
  const p = proto('a', [{ path: 'explore/v1.tsx', status: 'archived' }, { path: 'main.tsx' }], { start: 'explore/v1.tsx' });
  const { kept, archived, leftOut } = forDeploy([p]);
  assert.deepEqual(kept[0].items, [{ path: 'main.tsx' }]);
  assert.equal(kept[0].start, null);
  assert.deepEqual(archived, ['/prototypes/patrick/a/explore/v1.tsx']);
  assert.deepEqual(leftOut, { prototypes: 0, views: 1 });
});

test('a deploy keeps a start that is still there', () => {
  const p = proto('a', [{ path: 'x.tsx', status: 'archived' }, { path: 'main.tsx' }], { start: 'main.tsx' });
  assert.equal(forDeploy([p]).kept[0].start, 'main.tsx');
});

test('a prototype whose views are all archived is left out too', () => {
  const { kept, leftOut } = forDeploy([proto('a', [{ path: 'one.tsx', status: 'archived' }])]);
  assert.deepEqual(kept, []);
  assert.deepEqual(leftOut, { prototypes: 1, views: 0 });
});

test('a prototype with no items at all is kept', () => {
  assert.equal(forDeploy([proto('empty', [])]).kept.length, 1);
});

test('a canvas link to an archived view is found, and a longer name is not mistaken for it', () => {
  const canvas = '{"link":"http://localhost:5173/patrick/a/explore/v3"}';
  const archived = { items: ['/patrick/a/explore/v3'], prototypes: [] };
  assert.deepEqual(linksToArchived(canvas, archived), ['/patrick/a/explore/v3']);
  assert.deepEqual(linksToArchived('{"link":"http://localhost:5173/patrick/a/explore/v30"}', archived), []);
  assert.deepEqual(linksToArchived('{"link":"http://localhost:5173/patrick/a/explore/v3/more"}', archived), []);
});

test('a link into an archived prototype is found, but not into one with a longer name', () => {
  const archived = { items: [], prototypes: ['/patrick/old'] };
  assert.deepEqual(linksToArchived('see https://x.test/patrick/old/lofi/main.', archived), ['/patrick/old']);
  assert.deepEqual(linksToArchived('see https://x.test/patrick/older/lofi/main', archived), []);
});

test('relative document links to archived views are found', () => {
  const slugs = new Set(['explore/v3', 'lofi/main']);
  const text = 'See [the flow](./explore/v3) and [notes](../other), [site](https://example.com/explore/v3), [top](/explore/v3).';
  assert.deepEqual(relativeLinksToArchived('plan.md', text, slugs), ['explore/v3']);
  assert.deepEqual(relativeLinksToArchived('research/notes.md', 'Back to [main](../lofi/main.tsx#top)', slugs), ['lofi/main']);
  assert.deepEqual(relativeLinksToArchived('research/notes.md', '[x](./lofi/main)', slugs), []);
});

test('a link at the end of a sentence is still found', () => {
  assert.deepEqual(linksToArchived('Open /patrick/a/explore/v3.', { items: ['/patrick/a/explore/v3'], prototypes: [] }), ['/patrick/a/explore/v3']);
});
