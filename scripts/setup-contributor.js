// Usage:
//   pnpm join                          (dry run: prints the entry it would add)
//   pnpm join --yes                    (adds it to contributors.json)
//   pnpm join --key sam --name "Sam Lee" --github samlee --email sam@yourcompany.com --yes
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveContributor, loadContributors } from './resolve-contributor.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Keys that are app page URLs, so they can't be contributor folders (/systems is the Systems page).
const RESERVED = new Set(['systems']);
const PERSONAL = /@(gmail|googlemail|yahoo|hotmail|outlook|live|icloud|me|mac|aol|proton|protonmail|hey)\./i;

function run(cmd, args) {
  try { return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
}

// --key value, --name value, ... and --yes
const args = process.argv.slice(2).filter((a) => a !== '--');
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1].trim() : null;
};
const yes = args.includes('--yes');

if (RESERVED.has(flag('key'))) {
  console.error(`Key "${flag('key')}" is reserved (it's an app page URL, /${flag('key')}). Pass a different --key.`);
  process.exit(1);
}

const existing = resolveContributor();
if (existing) {
  console.log(`You're already a contributor: "${existing}". Your folder is src/prototypes/${existing}/.`);
  const entryName = loadContributors()[existing]?.name;
  const gitName = run('git', ['config', 'user.name']);
  if (entryName && gitName && entryName !== gitName) console.log(`Warning: that entry is for ${entryName}, but your Git name is ${gitName}. If that's not you, your GitHub account is shared with their entry.`);
  process.exit(0);
}

const contributors = loadContributors();
const name = flag('name') ?? run('git', ['config', 'user.name']);
const email = flag('email') ?? run('git', ['config', 'user.email']);
const github = flag('github') ?? run('gh', ['api', 'user', '--jq', '.login']);

// Key: lowercase first name, with a number added if it's taken.
let key = flag('key');
if (!key) {
  const base = (name.split(/\s+/)[0] ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '');
  key = base;
  for (let n = 2; key && (contributors[key] || RESERVED.has(key)); n++) key = `${base}${n}`;
}

const problems = [];
if (!key) problems.push('No key. Pass --key, or set your Git name (git config user.name).');
else if (!/^[a-z0-9][a-z0-9-]*$/.test(key)) problems.push(`Key "${key}" should be lowercase letters, numbers, and dashes.`);
else if (RESERVED.has(key)) problems.push(`Key "${key}" is reserved (it's an app page URL, /${key}). Pass a different --key.`);
else if (contributors[key]) problems.push(`Key "${key}" is already taken. Pass a different --key.`);
if (!name) problems.push('No name. Pass --name, or set git config user.name.');
if (!email) problems.push('No email. Pass --email, or set git config user.email.');
if (problems.length) {
  for (const p of problems) console.error(p);
  process.exit(1);
}

const entry = { name, github, email };
console.log(`${yes ? 'Adding' : 'Proposed'} contributors.json entry:\n${JSON.stringify({ [key]: entry }, null, 2)}`);
if (!yes) console.log('Name and email come from your Git config, and the GitHub username from the GitHub CLI, unless passed as flags.');
console.log(`Your folder will be src/prototypes/${key}/.`);
if (!github) console.log('Warning: no GitHub username (is the GitHub CLI installed and signed in?). Pass --github, or CI will not recognize your pushes.');
if (PERSONAL.test(email)) console.log(`Warning: ${email} looks like a personal email. Use your work email, the one in your Git config.`);

if (!yes) {
  console.log('Nothing written. Confirm these values, then rerun with --yes (and any corrections as flags).');
  process.exit(0);
}

fs.writeFileSync(path.join(ROOT, 'contributors.json'), JSON.stringify({ ...contributors, [key]: entry }, null, 2) + '\n');
const folder = path.join(ROOT, 'src', 'prototypes', key);
fs.mkdirSync(folder, { recursive: true });
fs.writeFileSync(path.join(folder, '.gitkeep'), '');
console.log(`Added "${key}" to contributors.json and created src/prototypes/${key}/.`);
