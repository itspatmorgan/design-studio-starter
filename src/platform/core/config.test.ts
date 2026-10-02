// What studio.config.ts may say (config.ts). Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import viewModule from '../modules/view/module.ts';
import textModule from '../modules/text/module.ts';
import { configProblems, isEnabled } from './config.ts';

const modules = [{ id: 'guide', optional: true }, { id: 'prototypes' }];

test('a name alone is a complete config', () => {
  assert.deepEqual(configProblems({ name: 'Acme Studio' }, modules), []);
  assert.deepEqual(configProblems({ name: 'Acme Studio', modules: {} }, modules), []);
});

test('a tagline is one short line of text', () => {
  assert.deepEqual(configProblems({ name: 'A', tagline: 'Prototypes for our team.' }, modules), []);
  assert.match(configProblems({ name: 'A', tagline: 42 as unknown as string }, modules)[0], /tagline/);
  assert.match(configProblems({ name: 'A', tagline: 'x'.repeat(141) }, modules)[0], /tagline/);
});

test('the name is required', () => {
  assert.match(configProblems({ name: ' ' }, modules)[0], /add a name/);
  assert.match(configProblems({}, modules)[0], /add a name/);
  assert.match(configProblems(undefined, modules)[0], /must export a config/);
});

test('a module that can be turned off may be', () => {
  assert.deepEqual(configProblems({ name: 'A', modules: { guide: false } }, modules), []);
  assert.deepEqual(configProblems({ name: 'A', modules: { guide: true, prototypes: true } }, modules), []);
});

test('a module other parts still use can not be turned off yet', () => {
  assert.match(configProblems({ name: 'A', modules: { prototypes: false } }, modules)[0], /prototypes module can't be turned off yet/);
});

test('an unknown module or a value that is not true or false is named', () => {
  assert.match(configProblems({ name: 'A', modules: { nope: false } }, modules)[0], /"nope".*Installed: guide, prototypes/);
  assert.match(configProblems({ name: 'A', modules: { guide: 'no' } }, modules)[0], /modules\.guide should be true or false/);
  assert.match(configProblems({ name: 'A', modules: ['guide'] }, modules)[0], /should list module ids/);
});

test('every module is on unless the config turns it off', () => {
  assert.equal(isEnabled({ name: 'A' }, 'guide'), true);
  assert.equal(isEnabled({ name: 'A', modules: { guide: false } }, 'guide'), false);
  assert.equal(isEnabled({ name: 'A', modules: { guide: false } }, 'prototypes'), true);
});

test('personal and team guidance are supported without changing module permissions', () => {
  for (const usage of ['personal', 'team'] as const) {
    assert.deepEqual(configProblems({ name: 'A', usage }, modules), []);
    assert.equal(isEnabled({ name: 'A', usage }, 'guide'), true);
  }
  assert.match(configProblems({ name: 'A', usage: 'other' } as unknown, modules)[0], /usage should be personal or team/);
});

test('Views and Text are required studio capabilities', () => {
  for (const module of [viewModule, textModule]) {
    assert.ok(configProblems({ name: 'Studio', modules: { [module.id]: false } }, [module]).length);
  }
});
