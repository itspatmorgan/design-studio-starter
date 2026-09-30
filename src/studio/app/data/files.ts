// A prototype's files, from the dev server (scripts/vite-files-plugin.js). Dev only: on the
// deployed site these return null, and the prototype navigation lists views from the manifest.
import { useEffect, useState } from 'react';
import type { Manifest, Prototype } from '@/studio/app/data/types';
import { SYSTEMS_KEY, rootOf } from '@/studio/roots';
import { withStatus, type Status, type StatusFormat } from '@/studio/archive';

export type FileNode = { name: string; path: string; dir: boolean; children?: FileNode[] };

const key = (p: Prototype) => `${p.contributorKey}/${p.id}`;

// This tab, sent with every change, so the manifest update it causes isn't applied twice
// (router.tsx): the tab that made the change applies it from the reply, in order.
export const TAB_ID = Math.random().toString(36).slice(2);

async function fetchFiles(p: Prototype): Promise<FileNode[] | null> {
  const res = await fetch(`/__studio/files?contributor=${encodeURIComponent(p.contributorKey)}&prototype=${encodeURIComponent(p.id)}`);
  return res.ok ? ((await res.json()) as { files: FileNode[] }).files : null;
}

// The prototype's file tree, refreshed whenever its files are added or removed.
// reload() refreshes it right away, after the app changes a file itself.
export function useFileTree(proto: Prototype) {
  const [files, setFiles] = useState<FileNode[] | null>(null);
  const [reload, setReload] = useState(() => () => {});
  useEffect(() => {
    if (!import.meta.hot) return;
    let live = true;
    const load = () => fetchFiles(proto).then((f) => { if (live) setFiles(f); }).catch(() => {});
    setReload(() => load);
    load();
    const onChange = (changed: string[]) => { if (changed.includes(key(proto))) load(); };
    import.meta.hot.on('studio:files', onChange);
    return () => { live = false; import.meta.hot?.off('studio:files', onChange); };
  }, [proto.contributorKey, proto.id]);
  return { files, reload };
}

// The file's path from the repo root, like src/prototypes/patrick/hello-world/meta.json (the
// prototype's folder for an empty `file`).
export const repoPath = (p: Prototype, file: string) => `src/${rootOf(p.contributorKey, p.id)}${file ? `/${file}` : ''}`;

// Opens a file in your code editor, with Vite's built-in /__open-in-editor.
// It uses $LAUNCH_EDITOR or the editor already running: https://github.com/yyx990803/launch-editor
// Vite finds the file from the folder the dev server was started in (the repo root), so the path is
// the full repo path, src/ included: without it the editor is never told to open anything.
export function openInEditor(p: Prototype, file: string) {
  fetch(`/__open-in-editor?file=${encodeURIComponent(repoPath(p, file))}`);
}

// Shows a file in Finder (or your system's file browser).
export function revealInFinder(p: Prototype, file: string) {
  fetch('/__studio/reveal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contributor: p.contributorKey, prototype: p.id, path: file }),
  });
}

// Your contributors.json key, from the dev server, or null (on the deployed site, or if
// you're not a contributor). The app lets you change files only in your own prototypes.
let meRequest: Promise<string | null> | undefined;
export function useMe() {
  const [me, setMe] = useState<string | null>(null);
  useEffect(() => {
    if (!import.meta.hot) return;
    meRequest ??= fetch('/__studio/me').then((r) => r.json()).then((j: { key: string | null }) => j.key).catch(() => null);
    meRequest.then(setMe);
  }, []);
  return me;
}

export type FileOp =
  | { op: 'create'; path: string; name: string; dir?: boolean }
  | { op: 'rename'; path: string; name: string }
  | { op: 'move'; path: string; to: string }
  | { op: 'delete'; path: string }
  | { op: 'meta'; title?: string; description?: string; start?: string; status?: Status }
  // A Handbook skill: skills/<name>/SKILL.md, in the Agent Skills format.
  | { op: 'create-skill'; name: string; description: string }
  // A prototype system's components: the examples and page one is missing.
  | { op: 'add-docs'; component: string };

export type FileOpResult = { path?: string; trashedTo?: string; manifest: Manifest };

// A prototype system's components folder, in the shape the file layer takes for a prototype
// (src/studio/roots.ts): what the Source view and the operations above are given.
export const systemFiles = (system: string): Prototype => ({
  id: system, contributorKey: SYSTEMS_KEY, title: system, description: '', contributor: '', created: null, system, start: null, items: [],
});

// Changes a file in your prototype (scripts/vite-files-plugin.js). Throws the server's message.
export async function fileOp(p: Prototype, op: FileOp): Promise<FileOpResult> {
  const res = await fetch('/__studio/op', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Studio-Tab': TAB_ID },
    body: JSON.stringify({ contributor: p.contributorKey, prototype: p.id, ...op }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Check that the dev server is still running.');
  return body;
}

// An item file's text and its version (a hash), for the Source view. Any prototype's, so other
// people's can be read. Throws the server's message.
export async function readSource(p: Prototype, path: string) {
  const query = new URLSearchParams({ contributor: p.contributorKey, prototype: p.id, path });
  const res = await fetch(`/__studio/file?${query}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Check that the dev server is still running.');
  return body as { content: string; version: string };
}

// Archives or unarchives an item in your prototype, by changing the tag in its file, in the form its
// type uses (src/studio/archive.ts). The manifest follows from the file changing, like any edit.
export async function setItemStatus(p: Prototype, path: string, status: Status, format: StatusFormat) {
  const { content, version } = await readSource(p, path);
  const next = withStatus(content, status, format);
  if (next !== content) await writeSource(p, path, next, version);
}

// The file changed on disk since it was read (its version isn't `base` any more).
export class SourceChanged extends Error {}

// Saves an item file in your prototype. `base` is the version you read or last saved.
export async function writeSource(p: Prototype, path: string, content: string, base: string) {
  const res = await fetch('/__studio/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contributor: p.contributorKey, prototype: p.id, path, content, base }),
  });
  const body = await res.json();
  if (res.status === 409) throw new SourceChanged(body.error);
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Check that the dev server is still running.');
  // `warnings` are problems with the file's format that the save didn't block (a skill's SKILL.md).
  return body as { version: string; warnings?: string[] };
}

// Creates a prototype in your folder, like pnpm new. Returns its URL parts and the new manifest.
export async function createPrototype(title: string, description: string) {
  const res = await fetch('/__studio/prototype', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Studio-Tab': TAB_ID },
    body: JSON.stringify({ title, description }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Check that the dev server is still running.');
  return body as { contributor: string; prototype: string; manifest: Manifest };
}

// Changes a prototype's title (and description). A new title renames its folder too, so its link
// changes: `prototype` in the reply is the folder name now. Throws the server's message.
export async function renamePrototype(p: Prototype, change: { title: string; description?: string }) {
  const res = await fetch('/__studio/prototype-rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Studio-Tab': TAB_ID },
    body: JSON.stringify({ contributor: p.contributorKey, prototype: p.id, ...change }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Check that the dev server is still running.');
  return body as { prototype: string; manifest: Manifest };
}

// Moves a prototype you own to the Trash. Returns where it went and the new manifest.
export async function deletePrototype(p: Prototype) {
  const res = await fetch('/__studio/prototype-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Studio-Tab': TAB_ID },
    body: JSON.stringify({ contributor: p.contributorKey, prototype: p.id }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Check that the dev server is still running.');
  return body as { trashedTo: string; manifest: Manifest };
}

