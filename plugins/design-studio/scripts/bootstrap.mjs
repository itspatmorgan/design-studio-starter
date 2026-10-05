import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const SOURCE = 'https://github.com/itspatmorgan/design-studio-starter.git';
export const REVISION = 'd2d8fe02f1e3ec64d09d60448fbf8de5574ade23';
export const RECEIPT = 'design-studio.local.json';
const REQUIRED = ['AGENTS.md', 'package.json', 'pnpm-lock.yaml', 'mise.toml', 'studio.config.ts', 'src/systems/studio/AGENTS.md'];

function run(command, args, cwd, live = false) {
  const result = spawnSync(command, args, {
    cwd, shell: false, encoding: 'utf8',
    stdio: live ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  if (result.error) throw new Error(`Could not run ${command}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed (${result.status ?? result.signal}). ${live ? 'See the setup log.' : (result.stderr || result.stdout || '').trim()}`);
  return result.stdout?.trim();
}

export function destinationPath(value) {
  if (!value || !path.isAbsolute(value)) throw new Error('Choose an absolute folder path on this computer.');
  const destination = path.resolve(value);
  if (destination === path.parse(destination).root || destination.split(path.sep).some((part) => ['.codex', '.agents', '.git', 'node_modules'].includes(part))) {
    throw new Error('Choose a visible folder outside plugin caches, Git internals, and dependency folders.');
  }
  return destination;
}

function verifyFiles(destination) {
  if (fs.lstatSync(destination).isSymbolicLink() || !fs.statSync(destination).isDirectory()) throw new Error('The studio folder must be an ordinary directory.');
  for (const relative of REQUIRED) {
    const file = path.join(destination, relative);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`This folder is missing ${relative}. Existing files were preserved.`);
    if (!fs.realpathSync(file).startsWith(fs.realpathSync(destination) + path.sep)) throw new Error(`${relative} points outside the studio.`);
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(destination, 'package.json'), 'utf8'));
  if (pkg.name !== 'design-studio-starter' || !pkg.scripts?.dev) throw new Error('This does not look like a Design Studio starter.');
  if (!fs.lstatSync(path.join(destination, '.git')).isDirectory()) throw new Error('Expected an ordinary local Git repository.');
}

export function inspectStudio(value) {
  const destination = destinationPath(value);
  verifyFiles(destination);
  const file = path.join(destination, RECEIPT);
  if (fs.lstatSync(file).isSymbolicLink()) throw new Error('The setup receipt must be an ordinary file.');
  const receipt = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (receipt.schema !== 1 || receipt.product !== 'design-studio' || !/^[0-9a-f]{40}$/.test(receipt.revision) || typeof receipt.name !== 'string' || typeof receipt.prepared !== 'boolean') throw new Error('The setup receipt is invalid. Existing files were preserved.');
  return { ...receipt, destination, existing: true };
}

export function createStudio({ destination: value, name = 'My Design Studio', source = SOURCE, revision = REVISION }) {
  const destination = destinationPath(value);
  if (!name.trim() || name.length > 120) throw new Error('Choose a studio name between 1 and 120 characters.');
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error('The starter revision must be a complete commit hash.');
  if (source !== SOURCE && !path.isAbsolute(source)) throw new Error('Test sources must be absolute local repository paths.');
  if (fs.existsSync(destination)) return inspectStudio(destination);
  run('git', ['--version']);
  const parent = path.dirname(destination);
  fs.mkdirSync(parent, { recursive: true });
  if (fs.realpathSync(parent) !== parent) throw new Error('Choose a folder whose parents are ordinary directories, not links.');
  const staging = fs.mkdtempSync(path.join(parent, '.design-studio-setup-'));
  try {
    run('git', ['init', '--initial-branch=main', staging]);
    run('git', ['-c', 'protocol.allow=never', '-c', source === SOURCE ? 'protocol.https.allow=always' : 'protocol.file.allow=always', 'fetch', '--depth=1', '--no-tags', '--', source, revision], staging);
    run('git', ['checkout', '-B', 'main', 'FETCH_HEAD'], staging);
    if (run('git', ['rev-parse', 'HEAD'], staging) !== revision) throw new Error('Downloaded starter did not match the pinned revision.');
    verifyFiles(staging);
    const receipt = { schema: 1, product: 'design-studio', source, revision, name: name.trim(), prepared: false };
    fs.writeFileSync(path.join(staging, RECEIPT), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
    fs.appendFileSync(path.join(staging, '.git/info/exclude'), `\n/${RECEIPT}\n`);
    // Reserve exclusively before moving anything. An existing folder is never replaced.
    fs.mkdirSync(destination);
    for (const entry of fs.readdirSync(staging)) fs.renameSync(path.join(staging, entry), path.join(destination, entry));
    return { ...receipt, destination, existing: false };
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

export function checkInitialConfiguration(studio) {
  if (!studio.prepared && run('git', ['diff', 'HEAD', '--', 'studio.config.ts'], studio.destination)) {
    throw new Error('Studio settings changed during setup. They were preserved. Review them before applying first-run defaults.');
  }
}

export function prepareStudio(value) {
  const studio = inspectStudio(value);
  checkInitialConfiguration(studio);
  run('mise', ['--version']);
  // Trust this inspected studio config, not all ancestor configurations.
  run('mise', ['trust', path.join(studio.destination, 'mise.toml')], studio.destination, true);
  run('mise', ['install'], studio.destination, true);
  run('mise', ['exec', 'pnpm@12', '--', 'pnpm', 'install', '--frozen-lockfile'], studio.destination, true);
  if (!studio.prepared) {
    run('mise', ['exec', 'pnpm@12', '--', 'pnpm', 'studio', 'configure', '--name', studio.name, '--usage', 'personal', '--tagline', 'Your ideas, made tangible.', '--yes'], studio.destination, true);
    const { destination, existing, ...receipt } = studio;
    receipt.prepared = true;
    fs.writeFileSync(path.join(destination, RECEIPT), JSON.stringify(receipt, null, 2) + '\n');
  }
  run('mise', ['exec', 'pnpm@12', '--', 'pnpm', 'studio', 'sync'], studio.destination, true);
  return inspectStudio(value);
}

export function startStudio(value, port = '5173') {
  const studio = inspectStudio(value);
  if (!/^[0-9]+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error('Choose a local port between 1024 and 65535.');
  run('mise', ['exec', 'pnpm@12', '--', 'pnpm', 'dev', '--host', '127.0.0.1', '--port', port], studio.destination, true);
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help') {
    console.log('Usage: node bootstrap.mjs create|inspect|prepare|start --destination <absolute-folder> [--name <name>] [--port <port>]\nMaintainer fixtures only: create --source <absolute-local-repo> --revision <40-character-commit>.\nGit and Node are prerequisites. prepare/start also require mise. No GitHub account is needed.');
    return;
  }
  if (!['create', 'inspect', 'prepare', 'start'].includes(command)) throw new Error(`Unknown command: ${command}`);
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!['--destination', '--name', '--port', '--source', '--revision'].includes(key) || !args[i + 1]) throw new Error(`Invalid option: ${key}`);
    if (options[key.slice(2)] !== undefined) throw new Error(`Repeated option: ${key}`);
    options[key.slice(2)] = args[i + 1];
  }
  if (command === 'start') return startStudio(options.destination, options.port);
  const result = command === 'create' ? createStudio(options) : command === 'prepare' ? prepareStudio(options.destination) : inspectStudio(options.destination);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try { main(); } catch (error) { console.error(`Could not complete studio setup: ${error.message}`); process.exitCode = 1; }
}
