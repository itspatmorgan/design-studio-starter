// Tests for the canvas tools (tools.ts) and the stored form (slim.ts). Run: pnpm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stringifyScene } from './slim.ts';
import { run, ToolError, type Ctx, type El } from './tools.ts';

const items: Record<string, { title: string; type: string; typeLabel: string; preview: boolean }> = {
  '/pat/demo/main': { title: 'Main', type: 'view', typeLabel: 'View', preview: true },
  '/pat/demo/notes': { title: 'Notes', type: 'document', typeLabel: 'Document', preview: false },
};
const ctx: Ctx = {
  base: '/pat/demo',
  item: (path) => (items[path] ? { path, ...items[path] } : null),
  items: () => ['main', 'notes'],
};

// Runs tools in turn on one scene, as a caller would.
function session() {
  let scene: El[] = [];
  return {
    get scene() { return scene; },
    call(tool: string, args: unknown) {
      const out = run(scene, tool, args, ctx);
      scene = out.elements;
      return out.result as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    live: () => scene.filter((el) => !el.isDeleted),
  };
}

test('create places things, resolves @refs, and describe reads them back', () => {
  const s = session();
  const { created, refs } = s.call('create', { elements: [
    { type: 'item', item: 'main', ref: 'main' },
    { type: 'item', item: 'notes.mdx', rightOf: '@main' },
    { type: 'note', text: 'Check the empty state', below: '@main', color: 'pink' },
    { type: 'rectangle', text: 'Payment', color: 'blue', x: 0, y: 900, ref: 'pay' },
  ] });
  assert.equal(created.length, 4);
  assert.ok(refs.main && refs.pay);
  const d = s.call('describe', {});
  const kinds = d.elements.map((e: El) => e.kind);
  assert.deepEqual(kinds, ['item', 'item', 'note', 'shape'], 'a shape colored blue is not mistaken for a blue note');
  const [view, card, note] = d.elements;
  assert.equal(view.item.title, 'Main');
  assert.equal(view.height, 338, 'a view is a screen');
  assert.equal(card.height, 88, 'a document is a card');
  assert.equal(card.x, view.x + view.width + 80);
  assert.equal(note.color, 'pink');
  assert.equal(note.y, view.y + view.height + 24);
});

test('errors say what to do', () => {
  const s = session();
  assert.throws(() => s.call('create', { type: 'item', item: 'nope' }), (e: Error) => e instanceof ToolError && /no view or document at \/pat\/demo\/nope.*main/.test(e.message));
  assert.throws(() => s.call('create', { type: 'rectangle', color: 'chartreuse' }), /isn't a color.*blue/);
  assert.throws(() => s.call('create', { type: 'blob' }), /unknown type.*note/);
  assert.throws(() => s.call('update', { id: 'nope', text: 'x' }), /no element nope/);
  assert.throws(() => s.call('nope', {}), /no tool "nope"/);
});

test('arrows stay attached: bound on both ends, and they follow a move', () => {
  const s = session();
  const { refs } = s.call('create', { elements: [
    { type: 'rectangle', text: 'A', x: 0, y: 0, ref: 'a' },
    { type: 'rectangle', text: 'B', x: 400, y: 0, ref: 'b' },
    { type: 'arrow', from: '@a', to: '@b', text: 'then' },
  ] });
  const arrow = s.live().find((e) => e.type === 'arrow')!;
  assert.equal(arrow.startBinding.elementId, refs.a);
  assert.equal(arrow.endBinding.elementId, refs.b);
  assert.ok(s.live().find((e) => e.id === refs.a)!.boundElements.some((b: El) => b.id === arrow.id), 'the shape lists the arrow');
  s.call('move', { id: refs.b, dx: 0, dy: 300 });
  const after = s.live().find((e) => e.id === arrow.id)!;
  assert.ok(after.points[1][1] > 0, 'the arrow now points down as well as across');
  assert.ok(after.version > arrow.version, 'a changed element has a newer version, so an open canvas takes it');
});

test('update changes text and colors, and a label follows its shape', () => {
  const s = session();
  const { refs } = s.call('create', { type: 'rectangle', text: 'Payment', color: 'blue', ref: 'p' });
  s.call('update', { id: refs.p, text: 'Payment (card)', color: 'violet', width: 300 });
  const shape = s.live().find((e) => e.id === refs.p)!;
  const label = s.live().find((e) => e.containerId === refs.p)!;
  assert.equal(label.originalText, 'Payment (card)');
  assert.equal(label.strokeColor, shape.strokeColor, 'the label takes the outline color');
  assert.equal(shape.width, 300);
  assert.ok(Math.abs(label.x + label.width / 2 - (shape.x + 150)) < 1, 'and stays centered');
  assert.throws(() => s.call('update', { id: refs.p, bogus: 1 }), /can't change bogus/);
});

test('delete takes labels and attached arrows with it, and cleans up references', () => {
  const s = session();
  const { refs } = s.call('create', { elements: [
    { type: 'rectangle', text: 'A', x: 0, y: 0, ref: 'a' },
    { type: 'rectangle', text: 'B', x: 400, y: 0, ref: 'b' },
    { type: 'arrow', from: '@a', to: '@b', text: 'then' },
  ] });
  s.call('delete', { id: refs.a });
  assert.deepEqual(s.live().map((e) => e.type).sort(), ['rectangle', 'text'], 'only B and its label are left');
  assert.deepEqual(s.live().find((e) => e.id === refs.b)!.boundElements.filter((b: El) => b.type === 'arrow'), []);
});

test('sections wrap their children, carry them when moved, and grow to hold what is put in them', () => {
  const s = session();
  const { refs } = s.call('create', { elements: [
    { type: 'note', text: 'one', x: 0, y: 0, ref: 'n1' },
    { type: 'note', text: 'two', x: 300, y: 0, ref: 'n2' },
    { type: 'section', name: 'Pair', children: ['@n1', '@n2'], ref: 's' },
  ] });
  const frame = s.live().find((e) => e.id === refs.s)!;
  assert.ok(frame.width >= 500 + 120 && frame.height >= 200 + 120, 'the frame wraps its children with padding');
  s.call('move', { id: refs.s, dy: 1000 });
  assert.equal(s.live().find((e) => e.id === refs.n1)!.y, 1000, 'children move with the section');
  const small = s.call('create', { elements: [{ type: 'section', name: 'Small', width: 300, height: 100, x: 0, y: 2000, ref: 'small' }, { type: 'item', item: 'main', section: '@small' }] });
  const grown = s.live().find((e) => e.id === small.refs.small)!;
  assert.ok(grown.height >= 338 + 120, 'a section grows so nothing is clipped');
  assert.equal(s.live().filter((e) => e.frameId === grown.id).length, 1);
});

test('the stored form is small and stable', () => {
  const s = session();
  s.call('create', { elements: [{ type: 'item', item: 'main', x: 0.123456, y: 0 }, { type: 'note', text: 'hi', x: 10, y: 10 }] });
  const text = stringifyScene(s.scene, { viewBackgroundColor: '#ffffff' });
  const file = JSON.parse(text);
  assert.equal(file.studioVersion, 1);
  assert.deepEqual(file.files, {});
  assert.equal(file.elements[0].link, '/pat/demo/main', 'links are app paths');
  assert.equal(file.elements[0].x, 0.12, 'numbers are rounded');
  assert.ok(!('isDeleted' in file.elements[0]) && !('angle' in file.elements[0]), 'defaults are left out');
  assert.equal(stringifyScene(s.scene), stringifyScene(JSON.parse(text).elements), 'saving twice writes the same file');
});
