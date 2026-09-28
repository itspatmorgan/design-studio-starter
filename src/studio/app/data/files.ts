// A prototype's files, from the dev server (scripts/vite-files-plugin.js). Dev only: on the
// deployed site these return null, and the prototype navigation lists views from the manifest.
import { useEffect, useState } from 'react';
import type { Manifest, Prototype } from '@/studio/app/data/types';

export type FileNode = { name: string; path: string; dir: boolean; children?: FileNode[] };

const key = (p: Prototype) => `${p.contributorKey}/${p.id}`;

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

// The file's path from the repo root, like src/prototypes/patrick/hello-world/meta.json.
export const repoPath = (p: Prototype, file: string) => `src/prototypes/${p.contributorKey}/${p.id}/${file}`;

// Opens a file in your code editor, with Vite's built-in /__open-in-editor.
// It uses $LAUNCH_EDITOR or the editor already running: https://github.com/yyx990803/launch-editor
export function openInEditor(p: Prototype, file: string) {
  fetch(`/__open-in-editor?file=${encodeURIComponent(`prototypes/${p.contributorKey}/${p.id}/${file}`)}`);
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
  | { op: 'meta'; title: string; description: string; start: string };

export type FileOpResult = { path?: string; trashedTo?: string; manifest: Manifest };

// Changes a file in your prototype (scripts/vite-files-plugin.js). Throws the server's message.
export async function fileOp(p: Prototype, op: FileOp): Promise<FileOpResult> {
  const res = await fetch('/__studio/op', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contributor: p.contributorKey, prototype: p.id, ...op }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'That didn\'t work.');
  return body;
}

// Creates a prototype in your folder, like pnpm new. Returns its URL parts and the new manifest.
export async function createPrototype(title: string, description: string) {
  const res = await fetch('/__studio/prototype', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? 'That didn\'t work.');
  return body as { contributor: string; prototype: string; manifest: Manifest };
}
