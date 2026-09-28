// A prototype's files, from the dev server (scripts/vite-files-plugin.js). Dev only: on the
// deployed site these return null, and the prototype navigation lists views from the manifest.
import { useEffect, useState } from 'react';
import type { Prototype } from '@/studio/app/data/types';

export type FileNode = { name: string; path: string; dir: boolean; children?: FileNode[] };

const key = (p: Prototype) => `${p.contributorKey}/${p.id}`;

async function fetchFiles(p: Prototype): Promise<FileNode[] | null> {
  const res = await fetch(`/__studio/files?contributor=${encodeURIComponent(p.contributorKey)}&prototype=${encodeURIComponent(p.id)}`);
  return res.ok ? ((await res.json()) as { files: FileNode[] }).files : null;
}

// The prototype's file tree, refreshed whenever its files are added or removed.
export function useFileTree(proto: Prototype) {
  const [files, setFiles] = useState<FileNode[] | null>(null);
  useEffect(() => {
    if (!import.meta.hot) return;
    let live = true;
    const load = () => fetchFiles(proto).then((f) => { if (live) setFiles(f); }).catch(() => {});
    load();
    const onChange = (changed: string[]) => { if (changed.includes(key(proto))) load(); };
    import.meta.hot.on('studio:files', onChange);
    return () => { live = false; import.meta.hot?.off('studio:files', onChange); };
  }, [proto.contributorKey, proto.id]);
  return files;
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
