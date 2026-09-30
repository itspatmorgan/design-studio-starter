// How a system's components and their docs are worked out (systemDocs.ts and
// scripts/lib/system-docs.js). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { componentProblems, discoverComponents, duplicateProblems, exampleNames, type ComponentPropsDoc } from './systemDocs.ts';
import { systemDocs } from '../../scripts/lib/system-docs.js';

const names = (files: string[]) => discoverComponents(files).map((c) => c.name);

test('flat files and folders both make components', () => {
  const found = discoverComponents(['button.tsx', 'button.examples.tsx', 'button.md', 'dialog/dialog.tsx', 'dialog/dialog.md', 'dialog/index.ts']);
  assert.deepEqual(found.map((c) => c.name), ['button', 'dialog']);
  assert.deepEqual(found[0].files, { source: 'button.tsx', examples: 'button.examples.tsx', doc: 'button.md' });
  assert.deepEqual(found[1].files, { source: 'dialog/dialog.tsx', examples: null, doc: 'dialog/dialog.md' });
});

test('files match by folder and name, ignoring case', () => {
  const [c] = discoverComponents(['Button/Button.tsx', 'Button/button.md']);
  assert.equal(c.name, 'Button');
  assert.equal(c.files.doc, 'Button/button.md');
  // The same name in another folder is another component, not a match.
  assert.equal(discoverComponents(['a/button.tsx', 'b/button.md']).length, 2);
});

test('several components can share a folder', () => {
  assert.deepEqual(names(['Button/Button.tsx', 'Button/IconButton.tsx', 'Button/IconButton.md']), ['Button', 'IconButton']);
});

test('a component\'s page is its name in kebab-case', () => {
  assert.deepEqual(discoverComponents(['IconButton.tsx', 'button.tsx']).map((c) => c.slug), ['button', 'icon-button']);
});

test('helpers, tests, stories, and READMEs are not components', () => {
  assert.deepEqual(names(['index.ts', 'a/index.tsx', '_util.tsx', '.hidden.tsx', 'button.test.tsx', 'button.stories.tsx', 'types.d.ts', 'README.md', 'lib.ts']), []);
});

test('a system whose components come from a package can hold only docs', () => {
  const [c] = discoverComponents(['card.md', 'card.examples.tsx']);
  assert.deepEqual(c.files, { source: null, examples: 'card.examples.tsx', doc: 'card.md' });
});

test('examples are the exports named with a capital', () => {
  const source = "export const Primary = () => null;\nexport function WithIcon() {}\nexport const meta = {};\nconst Hidden = 1;\nexport default Primary;\n";
  assert.deepEqual(exampleNames(source), ['Primary', 'WithIcon']);
  assert.deepEqual(exampleNames('export const meta = {};'), []);
});

const good = { frontmatter: { title: 'Button', description: 'Starts an action.' }, body: '## When to use\n\nFor actions.\n' };
const button = (files: Partial<ReturnType<typeof discoverComponents>[number]['files']> = {}) =>
  ({ name: 'button', slug: 'button', files: { source: 'button.tsx', examples: 'button.examples.tsx', doc: 'button.md', ...files } });

test('a complete component has no problems', () => {
  assert.deepEqual(componentProblems(button(), { doc: good, examples: 'export const Primary = () => null;' }), []);
});

test('a component with no companions gets one line, and one missing companion is named', () => {
  const alone = componentProblems(button({ examples: null, doc: null }), { doc: null, examples: null });
  assert.equal(alone.length, 1);
  assert.match(alone[0], /button\.examples\.tsx and button\.md/);
  assert.match(componentProblems(button({ doc: null }), { doc: null, examples: 'export const A = 1;' }).join('\n'), /no button\.md yet/);
  assert.match(componentProblems(button({ examples: null }), { doc: good, examples: null }).join('\n'), /no button\.examples\.tsx yet/);
});

test('the doc needs a title, a description, and a When to use section', () => {
  const problems = (doc: typeof good | { frontmatter: null; body: string }) => componentProblems(button(), { doc, examples: 'export const A = () => null;' }).join('\n');
  assert.match(problems({ frontmatter: null, body: '' }), /"title"[\s\S]*"description"[\s\S]*When to use/);
  assert.match(problems({ ...good, frontmatter: { title: 'B', description: '  ' } }), /"description"/);
  assert.match(problems({ ...good, body: '## Usage\n' }), /When to use/);
  // The scaffold's hint comment and code blocks don't count as a section.
  assert.match(problems({ ...good, body: '<!-- ## When to use -->\n```md\n## When to use\n```\n' }), /When to use/);
  assert.equal(problems({ ...good, body: '### when to use\n' }), '');
});

test('an examples file with no examples is a problem', () => {
  assert.match(componentProblems(button(), { doc: good, examples: 'export const meta = {};' }).join('\n'), /has no examples/);
});

test('two components with one name are reported once', () => {
  const found = discoverComponents(['a/card.tsx', 'b/Card.tsx']);
  const dupes = duplicateProblems(found);
  assert.equal(dupes.length, 1);
  assert.match(dupes[0].problem, /same name/);
});

test('scanning a folder returns manifest entries and problems', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'system-'));
  const write = (file: string, text: string) => { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), text); };
  write('button.tsx', 'export const Button = 1;');
  write('button.md', '---\ntitle: Button\ndescription: Starts an action.\ncategory: Actions\n---\n\n## When to use\n');
  write('button.examples.tsx', 'export const Primary = () => null;');
  write('input.tsx', 'export const Input = 1;');
  write('node_modules/x/y.tsx', 'x');
  write('.hidden/z.tsx', 'x');
  const { components, problems } = systemDocs(root);
  assert.deepEqual(components.map((c) => c.slug), ['button', 'input']);
  assert.equal(components[0].title, 'Button');
  assert.equal(components[0].category, 'Actions');
  assert.equal(components[1].title, 'input');
  assert.deepEqual(problems.map((p) => p.file), ['input.tsx']);
  assert.deepEqual(systemDocs(path.join(root, 'missing')), { components: [], problems: [] });
});

test('props are read from the code: types from other packages, defaults, native attributes', async () => {
  const { extractProps } = await import('../../scripts/lib/extract-props.js');
  const root = path.resolve(import.meta.dirname, '../..');
  const dir = path.join(root, 'src/systems/product/components');
  const files = ['button', 'input', 'dialog'].map((n) => path.join(dir, `${n}.tsx`));
  const result: Record<string, ComponentPropsDoc[]> = extractProps(files, root) as Record<string, ComponentPropsDoc[]>;
  const [button] = result[files[0]];
  assert.equal(button.name, 'Button');
  assert.equal(button.native, true);
  const variant = button.props.find((p) => p.name === 'variant')!;
  assert.equal(variant.default, '"default"');
  assert.match(variant.type, /"outline"/);
  assert.equal(variant.required, false);
  // No hundreds of native attributes in the table.
  assert.ok(button.props.length < 20);
  assert.deepEqual(result[files[1]].map((c) => [c.name, c.props.length, c.native]), [['Input', 0, true]]);
  const dialogs = result[files[2]].map((c) => c.name);
  assert.ok(dialogs.includes('Dialog') && dialogs.includes('DialogContent'));
  assert.ok(result[files[2]].find((c) => c.name === 'Dialog')!.props.some((p) => p.name === 'open'));
});
