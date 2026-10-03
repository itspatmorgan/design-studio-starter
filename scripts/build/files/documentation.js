import fs from 'node:fs';
import path from 'node:path';
import { canonicalDirectory } from '../../lib/safe-paths.js';
import { MAX_SOURCE_BYTES, versionOf } from './paths.js';

// Only indexed Markdown is editable; callers supply the current enabled catalog.
export function documentationFile(root, allowed, request) {
  if (!request || typeof request !== 'object' || !['read', 'write', 'reveal'].includes(request.action)) return { status: 400, body: { error: 'Choose a documentation file action.' } };
  if (typeof request.path !== 'string' || !allowed.includes(request.path)) return { status: 404, body: { error: 'This documentation file is unavailable.' } };
  const file = path.join(root, request.path);
  if (!canonicalDirectory(path.dirname(file), root)) return { status: 404, body: { error: 'This documentation file is unavailable.' } };
  let stat;
  try { stat = fs.lstatSync(file); } catch { return { status: 404, body: { error: 'This documentation file is unavailable.' } }; }
  if (!stat.isFile() || stat.isSymbolicLink()) return { status: 404, body: { error: 'This documentation file is unavailable.' } };
  if (request.action === 'reveal') return { body: { ok: true }, reveal: file };
  if (stat.size > MAX_SOURCE_BYTES) return { status: 413, body: { error: 'Keep documentation files under 750 KB.' } };
  const content = fs.readFileSync(file, 'utf8');
  if (request.action === 'read') return { body: { path: request.path, content, version: versionOf(content) } };
  if (typeof request.content !== 'string' || Buffer.byteLength(request.content) > MAX_SOURCE_BYTES) return { status: 413, body: { error: 'Keep documentation files under 750 KB.' } };
  if (request.base !== versionOf(content)) return { status: 409, body: { code: 'changed', error: 'This documentation changed on disk. Reload before saving.' } };
  fs.writeFileSync(file, request.content);
  return { body: { version: versionOf(request.content) } };
}
