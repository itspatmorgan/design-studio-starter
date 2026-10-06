import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readContributors } from './contributors.js';
import { readSettings } from './studio-settings.js';
import { applySetupChanges, editStudioConfig } from './studio-setup.js';
import { canonicalDirectory } from './safe-paths.js';
import { editorFile, openEditor } from '../build/files/editor.js';
import { reveal } from '../build/files/ops.js';
import { readDeclaration } from '../../src/platform/core/modules/pack.ts';
import { studioRole } from '../../src/platform/core/permissions.ts';

const ID = /^[a-z][a-z0-9-]*$/;
const KEY = /^[0-9a-f-]{36}$/;
/** @returns {never} */
function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }
function cli(root, args, apply = false) {
  const command = [path.join(root, 'scripts/cli/studio.js'), ...args];
  const options = { cwd: root, encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'] };
  try {
    execFileSync(process.execPath, command, options);
    if (apply) execFileSync(process.execPath, [...command, '--yes'], options);
  } catch (error) {
    const message = error.stderr?.trim().replace('Change their "system" first, or add --force.', 'Assign those prototypes to another system before removal.');
    fail(message || 'Could not update the system.');
  }
}
function archiveRoot(root, create = false) {
  const dir = path.join(root, '.trash', 'systems');
  if (create) {
    const trash = path.join(root, '.trash');
    if (!fs.existsSync(trash)) fs.mkdirSync(trash);
    if (!canonicalDirectory(trash, root)) fail('Studio trash must be a regular folder.');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  }
  return canonicalDirectory(dir, root) ? dir : null;
}
function archive(root, key) {
  if (typeof key !== 'string' || !KEY.test(key)) fail('Choose a removed system.');
  const base = archiveRoot(root);
  const dir = base && path.join(base, key);
  if (!dir || !canonicalDirectory(dir, root)) fail('This removed system is unavailable.', 404);
  const file = path.join(dir, 'record.json');
  if (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) fail('Invalid removal record.');
  const record = JSON.parse(fs.readFileSync(file, 'utf8'));
  const recoverable = record.state === 'removed' || (record.state === 'pending' && ID.test(record.id) && !fs.existsSync(path.join(root, 'src/systems', record.id)));
  if (!ID.test(record.id) || typeof record.label !== 'string' || !recoverable) fail('This system is no longer removed.');
  return { dir, record };
}

// Read declarations and roles on each request; configuration imports can be stale after a change.
export async function systemAction(root, actor, body) {
  const { contributors } = readContributors(root);
  const { config } = readSettings(root, contributors);
  const role = studioRole(config, actor, Object.keys(contributors));
  if (!role) fail('Register a contributor to use local system actions.', 403);
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.action !== 'string') fail('Choose a system action.');
  const { action, system, name, key } = body;
  if (!['open', 'reveal'].includes(action) && role !== 'admin') fail('Only an Admin can change shared systems.', 403);
  if (action === 'removed') {
    const base = archiveRoot(root);
    const items = [];
    for (const entry of base ? fs.readdirSync(base) : []) {
      try { const { record } = archive(root, entry); items.push({ key: entry, ...record }); } catch { /* Skip incomplete or restored records. */ }
    }
    return { items };
  }
  if (action === 'restore') {
    const { dir, record } = archive(root, key);
    if (fs.existsSync(path.join(root, 'src/systems', record.id))) fail('A system with this ID already exists. Rename or remove it before restoring.');
    cli(root, ['add', path.join(dir, 'system'), '--id', record.id], true);
    fs.writeFileSync(path.join(dir, 'record.json'), JSON.stringify({ ...record, state: 'restored' }, null, 2));
    return { id: record.id };
  }
  if (typeof system !== 'string' || !ID.test(system) || !config.systems.includes(system)) fail('Choose a registered system.', 404);
  const dir = editorFile(root, `src/systems/${system}`);
  const file = editorFile(root, `src/systems/${system}/system.ts`);
  if (!dir || !file) fail('This system must use regular source files.', 404);
  const before = fs.readFileSync(file, 'utf8');
  const declaration = readDeclaration(before);
  if ('error' in declaration) fail(declaration.error);
  const spec = declaration.value;
  if (action === 'open') return openEditor(dir, { reveal });
  if (action === 'reveal') { await reveal(dir); return {}; }
  if (spec.role !== 'prototype') fail('Studio is maintained by the platform. Its identity and availability are protected.');
  if (action === 'rename') {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120 || /[\n\r<>`$\\]/.test(name)) fail('Use a plain name between 1 and 120 characters.');
    applySetupChanges([{ file, before, after: editStudioConfig(before, { label: name.trim() }) }]);
    return { id: system };
  }
  if (action === 'default') { cli(root, ['configure', '--system', system], true); return { id: system }; }
  if (['remove', 'remove-check'].includes(action) && Object.hasOwn(config.modules ?? {}, system)) fail('This system’s ID conflicts with a module. Ask your agent to resolve this before removal.');
  if (['remove', 'remove-check'].includes(action) && config.defaultSystem === system) fail(`Choose another default system before removing ${spec.label}. Use Set as default from that system’s menu.`);
  if (action === 'remove-check') { cli(root, ['remove', system]); return { removable: true }; }
  if (action === 'remove') {
    // Preview dependencies first, then retain a complete copy before invoking the CLI's removal.
    cli(root, ['remove', system]);
    const base = archiveRoot(root, true);
    const key = randomUUID(); const backup = path.join(base, key);
    fs.mkdirSync(backup);
    fs.cpSync(dir, path.join(backup, 'system'), { recursive: true });
    for (const license of ['LICENSE', 'LICENSE.md']) {
      const source = path.join(root, license), target = path.join(backup, 'system', license);
      if (fs.existsSync(source) && !fs.existsSync(target)) fs.copyFileSync(source, target);
    }
    const record = { id: system, label: spec.label, removed: new Date().toISOString(), state: 'pending' };
    fs.writeFileSync(path.join(backup, 'record.json'), JSON.stringify(record, null, 2));
    cli(root, ['remove', system, '--yes']);
    fs.writeFileSync(path.join(backup, 'record.json'), JSON.stringify({ ...record, state: 'removed' }, null, 2));
    return { key };
  }
  fail('Unknown system action.');
}
