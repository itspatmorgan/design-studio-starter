// Guide source editing is local only. Requests name a chapter, never an arbitrary file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ModuleServer } from '../../core/modules/index.ts';
import { buildManifest } from '../../../../scripts/build/build-manifest.js';
import { canonicalDirectory } from '../../../../scripts/lib/safe-paths.js';
import { MAX_SOURCE_BYTES, versionOf } from '../../../../scripts/build/files/paths.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function sourceFile(slug: unknown) {
  if (typeof slug !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/i.test(slug)) return null;
  const page = buildManifest({ write: false, quiet: true }).manifest.guide.find((page) => page.slug === slug);
  const source = page?.source;
  // A standalone chapter can still be repaired if its frontmatter is temporarily invalid.
  const relative = source && /^\/platform\/modules\/[a-z][a-z0-9-]*\/README\.md$/.test(source)
    ? `src${source}` : `src/platform/modules/documentation/pages/${slug}.md`;
  const file = path.join(root, relative);
  if (!canonicalDirectory(path.dirname(file), root)) return null;
  try {
    const stat = fs.lstatSync(file);
    return stat.isFile() && !stat.isSymbolicLink() ? { file, relative, size: stat.size } : null;
  } catch { return null; }
}

function handle(body: unknown, write: boolean) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { status: 400, body: { error: 'Choose a Guide page.' } };
  const request = body as Record<string, unknown>;
  const target = sourceFile(request.slug);
  if (!target) return { status: 404, body: { error: 'This Guide source no longer exists.' } };
  if (target.size > MAX_SOURCE_BYTES) return { status: 413, body: { error: 'This file is too large to edit here.' } };
  const content = fs.readFileSync(target.file, 'utf8');
  if (!write) return { body: { path: target.relative, content, version: versionOf(content) } };
  if (typeof request.content !== 'string' || Buffer.byteLength(request.content) > MAX_SOURCE_BYTES) return { status: 413, body: { error: 'Keep source files under 750 KB.' } };
  if (request.base !== versionOf(content)) return { status: 409, body: { error: 'This file changed on disk since you opened it.', code: 'changed' } };
  fs.writeFileSync(target.file, request.content);
  return { body: { version: versionOf(request.content) } };
}

export default {
  read: ({ body }) => handle(body, false),
  write: ({ body }) => handle(body, true),
} satisfies ModuleServer;
