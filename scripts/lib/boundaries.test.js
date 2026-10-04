import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { scopePolicy } from './scope.js';
import { importsOf, dependencyResolver, moduleConsumers } from './imports.js';
import { cssProblems } from './css-scope.js';
import { canonicalDirectory } from './safe-paths.js';
import { themeClassProblems } from '../../src/platform/modules/systems/spec.ts';

const temporary = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'studio-boundaries-')));
const write = (root, file, code) => { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, code); return target; };

test('runtime dependency scopes reject indirect, private, documentation and dotted-folder escapes', () => {
  const root = temporary();
  try {
    const policy = scopePolicy({ root, systems: { product: { dir: 'src/systems/product' }, brand: { dir: 'src/systems/brand' } }, defaultSystem: 'product', modules: [{ id: 'extra', lib: true, optional: true }] });
    const file = (p) => path.join(root, p);
    const cases = [
      ['src/prototypes/sam/flow.v1/main.tsx', 'src/platform/app/router.tsx', false],
      ['src/prototypes/sam/flow.v1/main.tsx', 'src/systems/platform/components/button.tsx', false],
      ['src/prototypes/sam/flow.v1/main.tsx', 'src/prototypes/sam/flow.v1/_helper.ts', true],
      ['src/prototypes/sam/flow.v1/main.tsx', 'src/systems/product/components/button.tsx', true],
      ['src/prototypes/sam/flow.v1/main.tsx', 'src/systems/brand/components/button.tsx', false],
      ['src/prototypes/sam/flow.v1/main.tsx', 'src/systems/product/intro.tsx', false],
      ['src/systems/product/components/button.tsx', 'src/systems/platform/components/button.tsx', false],
      ['src/systems/product/components/button.tsx', 'src/prototypes/sam/other/main.tsx', false],
      ['src/systems/product/components/button.tsx', 'src/systems/brand/components/button.tsx', false],
      ['src/systems/product/components/button.tsx', 'src/lib/portal.ts', true],
      ['src/lib/shared.ts', 'src/prototypes/sam/other/main.tsx', false],
      ['src/lib/shared.ts', 'src/systems/product/components/button.tsx', false],
      ['src/lib/shared.ts', 'src/lib/other.ts', true],
      ['src/platform/modules/extra/lib/index.ts', 'src/platform/app/router.tsx', false],
      ['src/platform/modules/extra/lib/index.ts', 'src/platform/modules/extra/lib/helper.ts', true],
    ];
    for (const [from, to, allowed] of cases) assert.equal(policy.problem('./target', file(from), file(to)) === null, allowed, `${from} → ${to}`);
    const proto = file('src/prototypes/sam/flow.v1/main.tsx');
    assert.equal(policy.problem('@module/extra', proto, file('src/platform/modules/extra/lib/index.ts')), null);
    assert.match(policy.problem('@/platform/modules/extra/lib/private', proto, file('src/platform/modules/extra/lib/private.ts')), /scope/);
    assert.match(policy.problem('@/platform/modules/extra/lib/index', proto, file('src/platform/modules/extra/lib/index.ts')), /scope/);
    assert.equal(policy.scopeOf(file('src/systems/product/intro.tsx')), null, 'documentation can use platform adapters');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('the shared AST resolver finds aliases, root paths, exports and dynamic imports without reading string examples as code', () => {
  const root = temporary();
  try {
    write(root, 'tsconfig.app.json', JSON.stringify({ compilerOptions: { paths: { '@custom/*': ['./src/custom/*'] } } }));
    const entry = write(root, 'src/platform/modules/extra/lib/index.ts', 'export const value = 1');
    const consumer = write(root, 'src/lib/consumer.ts', "export {value} from '/platform/modules/extra/lib/index.ts'; import type {Value} from '@module/extra'; const example = \"import value from 'ignored'\";");
    const custom = write(root, 'src/custom/value.ts', 'export const value = 1');
    const resolve = dependencyResolver(root);
    for (const source of ['@module/extra', '@/platform/modules/extra/lib/index', '/platform/modules/extra/lib/index.ts', '../platform/modules/extra/lib/index']) assert.equal(resolve(source, consumer), entry);
    assert.equal(resolve('@custom/value', consumer), custom);
    write(root, 'src/lib/type-consumer.ts', "export type Value = import('@module/extra').Value;");
    assert.deepEqual(moduleConsumers(root, 'extra'), ['src/lib/consumer.ts', 'src/lib/type-consumer.ts']);
    assert.deepEqual(importsOf("import type {A} from './types'; export {x} from './x'; import('./lazy'); import(choice)"), [
      { source: './types', typeOnly: true }, { source: './x', typeOnly: false }, { source: './lazy', typeOnly: false }, { source: null, typeOnly: false },
    ]);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('CSS validation contains exact selector targets, nested rules and imported styles', () => {
  const root = temporary();
  try {
    const file = path.join(root, 'theme.css');
    const check = (code, mode = 'theme') => cssProblems(code, { file, themeClass: 'product-theme', mode });
    for (const code of ['body {color:red}', 'body:has(.product-theme) {color:red}', '.product-theme-other {color:red}', '.product-theme + body {color:red}', '.product-theme { & ~ body {color:red} }', '@import "https://example.test/global.css";', '@keyframes pulse {from {opacity:0} to {opacity:1}}']) assert.ok(check(code).length, code);
    assert.match(check('.dark .product-theme {color:red}').join(' '), /global color-mode/);
    assert.match(check('.product-theme { .dark & {color:red} }').join(' '), /global color-mode/);
    for (const code of ['.product-theme {color:red}', '.product-theme[data-color-mode="dark"] button {color:red}', '.product-theme { &:hover {color:red} .child {color:blue} }', '@media (width > 1px) {.product-theme {color:red}}', '@font-face {font-family:Example;src:url(example.woff2)}']) assert.deepEqual(check(code), [], code);
    for (const code of [':global(body) {color:red}', ':global .local {color:red}', 'body {color:red}', '.local + body {color:red}']) assert.ok(check(code, 'module').length, code);
    assert.deepEqual(check('.local {color:red} .local:hover > span {color:blue}', 'module'), []);
    write(root, 'imported.css', 'body {color:red}');
    assert.ok(check('@import "./imported.css";').length);
    write(root, 'imported.css', '.product-theme {color:red}');
    assert.deepEqual(check('@import "./imported.css";'), []);
    assert.ok(themeClassProblems({ a: { themeClass: 'same' }, b: { themeClass: 'same' } }).length);
    assert.ok(themeClassProblems({ a: { themeClass: 'dark' } }).length);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('canonical scope roots reject links at either contributor or prototype level', () => {
  const root = temporary();
  try {
    fs.mkdirSync(path.join(root, 'alex/other'), { recursive: true });
    fs.mkdirSync(path.join(root, 'sam'));
    fs.symlinkSync(path.join(root, 'alex/other'), path.join(root, 'sam/linked'));
    fs.symlinkSync(path.join(root, 'alex'), path.join(root, 'alias'));
    assert.equal(canonicalDirectory(path.join(root, 'sam/linked'), root), null);
    assert.equal(canonicalDirectory(path.join(root, 'alias/other'), root), null);
    assert.equal(canonicalDirectory(path.join(root, 'alex/other'), root), path.join(root, 'alex/other'));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('private module consumers and symlink scopes are rejected; disabled app and file-type code is absent from the production bundle', () => {
  const root = temporary();
  const original = path.resolve('.');
  try {
    fs.cpSync(original, root, { recursive: true, filter: (file) => !['node_modules', 'dist', '.git'].includes(path.basename(file)) });
    fs.symlinkSync(path.join(original, 'node_modules'), path.join(root, 'node_modules'));
    const run = (file, ...args) => execFileSync(process.execPath, [file, ...args], { cwd: root, encoding: 'utf8', stdio: 'pipe', timeout: 60000, env: { ...process.env, MISE_TRUSTED_CONFIG_PATHS: root } });
    const attempt = (file, ...args) => spawnSync(process.execPath, [file, ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, MISE_TRUSTED_CONFIG_PATHS: root } });
    write(root, 'src/platform/modules/extra/module.ts', "export default {id:'extra',label:'Extra',version:'0.1.0',optional:true,lib:true};");
    write(root, 'src/platform/modules/extra/lib/index.ts', 'export const value = 1;');
    write(root, 'src/platform/modules/extra/lib/private.ts', 'export const hidden = 1;');
    for (const entry of ['app.tsx', 'open.tsx', 'type.ts']) write(root, `src/platform/modules/extra/${entry}`, "globalThis['__BOUNDARY_DISABLED_SENTINEL__'] = true; export default {};");
    const consumer = write(root, 'src/lib/private-consumer.ts', "export {hidden} from '/platform/modules/extra/lib/private.ts';");
    assert.equal(attempt('scripts/check/check-modules.js').status, 1);
    fs.writeFileSync(consumer, "export {value} from '@module/extra';");
    const removal = attempt('scripts/cli/studio.js', 'remove', 'extra');
    assert.equal(removal.status, 1, removal.stdout + removal.stderr);
    assert.match(removal.stdout + removal.stderr, /private-consumer/);
    fs.rmSync(consumer);
    run('scripts/cli/studio.js', 'disable', 'extra');
    run('--input-type=module', '--eval', `
      import fs from 'node:fs'; import path from 'node:path'; import assert from 'node:assert/strict';
      import {prototypeDir,resolveInside} from './scripts/build/files/paths.js';
      import {canChange} from './scripts/build/files/policy.js';
      const base='src/prototypes'; fs.mkdirSync(base+'/scope-alex/other',{recursive:true}); fs.mkdirSync(base+'/scope-sam');
      fs.writeFileSync(base+'/scope-alex/other/meta.json','{"title":"Other"}'); fs.writeFileSync(base+'/scope-alex/other/notes.md','# Other');
      fs.symlinkSync(path.resolve(base+'/scope-alex/other'),base+'/scope-sam/linked');
      const linked=path.resolve(base+'/scope-sam/linked');
      assert.equal(prototypeDir('scope-sam','linked'),null); assert.equal(resolveInside(linked,'notes.md'),null); assert.equal(canChange('scope-sam','scope-sam',linked),false);
      fs.mkdirSync(base+'/scope-sam/metadata'); fs.symlinkSync(path.resolve(base+'/scope-alex/missing.json'),base+'/scope-sam/metadata/meta.json');
      assert.equal(prototypeDir('scope-sam','metadata'),null); assert.equal(canChange('scope-sam','scope-sam',path.resolve(base+'/scope-sam/metadata')),false);
      fs.rmSync(base+'/scope-sam',{recursive:true,force:true}); fs.rmSync(base+'/scope-alex',{recursive:true,force:true});
    `);
    run('scripts/build/build-manifest.js', '--strict');
    write(root, 'src/systems/product/styles/imported.css', '.product-theme .scope-import-proof {color:red}');
    const theme = path.join(root, 'src/systems/product/styles/theme.css');
    fs.writeFileSync(theme, '@import "./imported.css";\n' + fs.readFileSync(theme, 'utf8'));
    run('node_modules/vite/bin/vite.js', 'build');
    const output = [...fs.readdirSync(path.join(root, 'dist/assets'))].filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(root, 'dist/assets', f), 'utf8')).join('');
    assert.equal(output.includes('__BOUNDARY_DISABLED_SENTINEL__'), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('Tailwind inventories allow intentional omissions and reject inherited references', async () => {
  const { tailwindThemeProblems, themeInventory, themeAdapter, scopeThemeUtilities } = await import('./tailwind-theme.js');
  const options = { file: 'test.css', styling: 'tailwind', themeClass: 'product-theme' };
  assert.deepEqual(tailwindThemeProblems('.product-theme { --shadow-sm: 0 1px black; }', options), []);
  assert.ok(tailwindThemeProblems('.product-theme[data-color-mode="dark"] { --blur-xs: 4px; }', options).some(p => p.includes('base value')));
  assert.ok(tailwindThemeProblems('.product-theme { --blur-xs: var(--missing-blur); }', options).some(p => p.includes('references --missing-blur')));
  const systems = [
    { role: 'platform', styling: 'tailwind', themeClass: 'platform-theme', inventory: themeInventory('.platform-theme { --shadow-sm: 0 1px black; --shadow-lg: 0 4px black; --spacing-4: 1rem; }', 'platform-theme') },
    { role: 'prototype', styling: 'tailwind', themeClass: 'product-theme', inventory: themeInventory('.product-theme { --shadow-sm: 0 2px black; }', 'product-theme') },
    { role: 'prototype', styling: 'tailwind', themeClass: 'marketing-theme', inventory: themeInventory('.marketing-theme { --color-bg-brand-solid: #7f56d9; }', 'marketing-theme') },
  ];
  const { compile } = await import('tailwindcss');
  const compiler = await compile(themeAdapter(systems) + '\n@layer utilities { @tailwind utilities; }');
  const compiled = compiler.build(['shadow-sm', 'shadow-lg', 'shadow-xl', 'p-4', 'p-5', 'flex', 'rounded-full', 'bg-bg-brand-solid']);
  assert.ok(!compiled.includes('.shadow-xl'));
  assert.ok(!compiled.includes('.p-5'));
  const scoped = scopeThemeUtilities(compiled, systems);
  assert.match(scoped, /@scope \(.product-theme\) to \(.platform-theme, .marketing-theme\)/);
  const postcss = (await import('postcss')).default;
  const root = postcss.parse(scoped);
  const product = [];
  const marketing = [];
  const selectorParser = (await import('postcss-selector-parser')).default;
  root.walkAtRules('scope', rule => {
    const list = rule.params.startsWith('(.product-theme)') ? product : rule.params.startsWith('(.marketing-theme)') ? marketing : null;
    if (list) rule.walkRules(r => selectorParser(tree => tree.walkClasses(c => list.push('.' + c.value))).processSync(r.selector));
  });
  assert.ok(scoped.includes(':scope:is(.flex)'), 'frame utilities must apply to the theme boundary itself');
  assert.ok(product.includes('.shadow-sm'));
  assert.ok(product.includes('.flex'));
  assert.ok(!product.includes('.shadow-lg'));
  assert.ok(!product.includes('.p-4'));
  assert.ok(!product.includes('.rounded-full'));
  assert.ok(!product.includes('.bg-bg-brand-solid'));
  assert.ok(marketing.includes('.bg-bg-brand-solid'));
  assert.ok(marketing.includes('.flex'));
  assert.ok(!marketing.includes('.shadow-sm'));
  assert.ok(scoped.includes('--shadow-lg: initial'));
});

test('utility diagnostics distinguish omitted tokens from unrelated text', async () => {
  const { themeInventory } = await import('./tailwind-theme.js');
  const { themeUsageProblems, literalCandidates } = await import('./theme-usage.js');
  assert.deepEqual(literalCandidates('window.addEventListener("blur", handler);', 'event.ts'), []);
  const dir = temporary();
  try {
    const file = write(dir, 'view.tsx', '<div className="shadow-lg flex" />');
    const system = { themeClass: 'example-theme', styling: 'tailwind', inventory: themeInventory('.example-theme { --shadow-sm: 0 1px black; }', 'example-theme') };
    const problems = await themeUsageProblems([system], () => [file]);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /shadow-lg requires --shadow-lg/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
