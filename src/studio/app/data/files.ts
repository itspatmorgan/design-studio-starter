// A prototype's files, from the dev server (scripts/build/vite-files-plugin.js). Dev only: on the
// deployed site these return null, and the prototype navigation lists views from the manifest.
import { useEffect, useState } from 'react';
import type { Manifest, Prototype, PrototypeInfo } from '@/studio/app/data/types';
import { SYSTEMS_KEY, rootOf } from '@/studio/core/roots';
import { MODULES } from '@/studio/app/data/modules';
import { canChange, canOwn, policyFor } from '@/studio/core/permissions';
import type { Status } from '@/studio/core/archive';

export type FileNode = { name: string; path: string; dir: boolean; children?: FileNode[] };

const key = (p: PrototypeInfo) => `${p.contributorKey}/${p.id}`;

// This tab, sent with every change, so the manifest update it causes isn't applied twice
// (router.tsx): the tab that made the change applies it from the reply, in order.
export const TAB_ID = Math.random().toString(36).slice(2);

async function fetchFiles(p: PrototypeInfo): Promise<FileNode[] | null> {
  const res = await fetch(`/__studio/files?contributor=${encodeURIComponent(p.contributorKey)}&prototype=${encodeURIComponent(p.id)}`);
  return res.ok ? ((await res.json()) as { files: FileNode[] }).files : null;
}

// The prototype's file tree, refreshed whenever its files are added or removed.
// reload() refreshes it right away, after the app changes a file itself.
export function useFileTree(proto: PrototypeInfo) {
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
export const repoPath = (p: PrototypeInfo, file: string) => `src/${rootOf(p.contributorKey, p.id)}${file ? `/${file}` : ''}`;

// Opens a file in your code editor, with Vite's built-in /__open-in-editor.
// It uses $LAUNCH_EDITOR or the editor already running: https://github.com/yyx990803/launch-editor
// Vite finds the file from the folder the dev server was started in (the repo root), so the path is
// the full repo path, src/ included: without it the editor is never told to open anything.
export function openInEditor(p: PrototypeInfo, file: string) {
  fetch(`/__open-in-editor?file=${encodeURIComponent(repoPath(p, file))}`);
}

// Shows a file in Finder (or your system's file browser).
export function revealInFinder(p: PrototypeInfo, file: string) {
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

// Whether you own a prototype (so you may archive or delete it): your own, or a tool you maintain. The
// policy of its section decides (src/studio/core/permissions.ts); the dev server checks again on every change.
const subject = (p: PrototypeInfo, me: string | null) => ({ me, key: p.contributorKey, maintainers: p.maintainers });
const policyOf = (p: PrototypeInfo) => policyFor(p.contributorKey, MODULES);
export const ownsPrototype = (p: PrototypeInfo, me: string | null) => canOwn(policyOf(p), subject(p, me));
// Whether you may change its files: that, or files open to everyone (the Handbook's, the systems').
export const canChangePrototype = (p: PrototypeInfo, me: string | null) => canChange(policyOf(p), subject(p, me));

export type FileOp =
  | { op: 'create'; path: string; name: string; dir?: boolean }
  | { op: 'rename'; path: string; name: string }
  | { op: 'move'; path: string; to: string }
  | { op: 'delete'; path: string }
  // Put a file or folder before another in its folder (`before` empty: last), moving it to folder `to` first if that's elsewhere.
  | { op: 'reorder'; path: string; to?: string; before?: string }
  | { op: 'meta'; title?: string; description?: string; start?: string; status?: Status }
  // A Handbook skill: skills/<name>/SKILL.md, in the Agent Skills format.
  | { op: 'create-skill'; name: string; description: string }
  // A prototype system's components: the examples and page one is missing.
  | { op: 'add-docs'; component: string };

export type FileOpResult = { path?: string; trashedTo?: string; manifest: Manifest };

// A prototype system's components folder, in the shape the file layer takes for a prototype
// (src/studio/core/roots.ts): what the Source view and the operations above are given.
export const systemFiles = (system: string): Prototype => ({
  id: system, contributorKey: SYSTEMS_KEY, title: system, description: '', contributor: '', created: null, system, start: null, items: [],
});

// Changes a file in your prototype (scripts/build/vite-files-plugin.js). Throws the server's message.
export async function fileOp(p: PrototypeInfo, op: FileOp): Promise<FileOpResult> {
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
export async function readSource(p: PrototypeInfo, path: string) {
  const query = new URLSearchParams({ contributor: p.contributorKey, prototype: p.id, path });
  const res = await fetch(`/__studio/file?${query}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Check that the dev server is still running.');
  return body as { content: string; version: string };
}

// Switches an item in your prototype to lofi or back, by changing the marker in its file the way its
// type says (fidelity in its type.ts). The manifest follows from the file changing, like any edit.
export async function setItemLofi(p: PrototypeInfo, path: string, on: boolean, fidelity: { setLofi(source: string, on: boolean): string }) {
  const { content, version } = await readSource(p, path);
  const next = fidelity.setLofi(content, on);
  if (next !== content) await writeSource(p, path, next, version);
}

// The file changed on disk since it was read (its version isn't `base` any more).
export class SourceChanged extends Error {}

// Saves an item file in your prototype. `base` is the version you read or last saved.
export async function writeSource(p: PrototypeInfo, path: string, content: string, base: string) {
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
export async function renamePrototype(p: PrototypeInfo, change: { title: string; description?: string }) {
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
export async function deletePrototype(p: PrototypeInfo) {
  const res = await fetch('/__studio/prototype-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Studio-Tab': TAB_ID },
    body: JSON.stringify({ contributor: p.contributorKey, prototype: p.id }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Check that the dev server is still running.');
  return body as { trashedTo: string; manifest: Manifest };
}

// Calls a route a module adds to the dev server (its server.ts, src/studio/core/modules/index.ts): POST /__studio/<module>/<route>.
// Resolves with the server's reply, or throws its message.
export async function callModule<T>(module: string, route: string, body: object): Promise<T> {
  const res = await fetch(`/__studio/${module}/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Studio-Tab': TAB_ID },
    body: JSON.stringify(body),
  });
  const reply = await res.json();
  if (!res.ok) throw new Error(reply.error ?? 'Something went wrong. Check that the dev server is still running.');
  return reply as T;
}
