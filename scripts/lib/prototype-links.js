import fs from 'node:fs';
import path from 'node:path';

export const escapeAddress = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const personAddress = (key, id) => `(?:/prototypes)?${escapeAddress(`/${key}/${id}`)}`;
export const addressPattern = (address) => new RegExp(`(?<![A-Za-z0-9:/.])${address}(?![A-Za-z0-9_%-])`, 'g');

// Never follow symlinks or edit another prototype. Only documents and canvas files store links.
export function linkedFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? linkedFiles(file) : entry.isFile() && /\.(md|excalidraw)$/.test(entry.name) ? [file] : [];
  });
}

// Read and prepare everything before moving. If a write fails, restore the files and address.
export function moveWithLinks(from, to, meta, address, nextAddress) {
  const changes = linkedFiles(from).map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    return { rel: path.relative(from, file), content, next: content.replace(addressPattern(address), nextAddress) };
  }).filter(({ content, next }) => content !== next);
  const originalMeta = fs.readFileSync(path.join(from, 'meta.json'), 'utf8');
  changes.push({ rel: 'meta.json', content: originalMeta, next: JSON.stringify(meta, null, 2) + '\n' });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (from !== to) fs.renameSync(from, to);
  try {
    for (const change of changes) fs.writeFileSync(path.join(to, change.rel), change.next);
  } catch (error) {
    for (const change of changes) fs.writeFileSync(path.join(to, change.rel), change.content);
    if (from !== to) fs.renameSync(to, from);
    throw error;
  }
}
