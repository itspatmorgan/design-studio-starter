import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveContributor, loadContributors } from './resolve-contributor.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const title = process.argv.slice(2).join(' ').trim();
if (!title) { console.error('Usage: pnpm new "Prototype Name"'); process.exit(1); }

const slug = title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
if (!slug) { console.error(`Can't make a folder name from "${title}".`); process.exit(1); }

const key = resolveContributor();
if (!key) { console.error('You are not in contributors.json. Add yourself first.'); process.exit(1); }

const dest = path.join(ROOT, 'src', 'prototypes', key, slug);
if (fs.existsSync(dest)) { console.error(`src/prototypes/${key}/${slug} already exists.`); process.exit(1); }

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(path.join(ROOT, 'scripts', 'templates', 'prototype'), dest, { recursive: true });
const metaPath = path.join(dest, 'meta.json');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
Object.assign(meta, { title, contributor: loadContributors()[key].name, created: today });
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');

execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build-manifest.js')], { stdio: 'inherit' });
console.log(`Created src/prototypes/${key}/${slug}/`);
console.log(`Open it with pnpm dev, at /${key}/${slug}`);
