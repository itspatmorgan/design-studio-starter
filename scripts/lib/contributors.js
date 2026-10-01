// Who the contributors are: contributors.json (everyone in one file) and contributors/<key>.json (one file per person).
// Both are read and merged, so an existing team's file keeps working. New people are added as their own file
// (pnpm join), which means two people joining at once never conflict in Git, however large the team gets.
// A person's file is { "name": ..., "github": ..., "email": ... }, and its name is their key.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CONTRIBUTORS_FILE = path.join(ROOT, 'contributors.json');
export const CONTRIBUTORS_DIR = path.join(ROOT, 'contributors');
export const KEY = /^[a-z0-9][a-z0-9-]*$/;

const readJson = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { throw new Error(`${path.relative(ROOT, file)} isn't valid JSON (${e.message}).`); }
};

// Every contributor by key, and the keys defined in both places, which `pnpm check` reports.
export function readContributors() {
  const contributors = fs.existsSync(CONTRIBUTORS_FILE) ? readJson(CONTRIBUTORS_FILE) : {};
  const twice = [];
  const problems = [];
  const files = fs.existsSync(CONTRIBUTORS_DIR) ? fs.readdirSync(CONTRIBUTORS_DIR).filter((f) => f.endsWith('.json')).sort() : [];
  for (const file of files) {
    const key = file.slice(0, -5);
    if (!KEY.test(key)) { problems.push(`contributors/${file}: a contributor's key is lowercase letters, numbers, and dashes.`); continue; }
    const entry = readJson(path.join(CONTRIBUTORS_DIR, file));
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { problems.push(`contributors/${file} should be { "name": ..., "github": ..., "email": ... }.`); continue; }
    if (key in contributors) twice.push(key);
    contributors[key] = entry;
  }
  return { contributors, twice, problems };
}

export const loadContributors = () => readContributors().contributors;

// Changes when anyone is added or edited: what a cache of anything worked out from the contributors must key on.
export function contributorsSignature() {
  const stat = (f) => { try { const s = fs.statSync(f); return `${s.mtimeMs}:${s.size}`; } catch { return '-'; } };
  const files = fs.existsSync(CONTRIBUTORS_DIR) ? fs.readdirSync(CONTRIBUTORS_DIR).sort() : [];
  return [stat(CONTRIBUTORS_FILE), ...files.map((f) => `${f}:${stat(path.join(CONTRIBUTORS_DIR, f))}`)].join('|');
}

export const contributorFile = (key) => path.join(CONTRIBUTORS_DIR, `${key}.json`);
