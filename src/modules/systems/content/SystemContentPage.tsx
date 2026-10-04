import { lazy, Suspense, useEffect, useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Button } from '@/systems/studio/components/button';
import { findArtifact } from '@/platform/app/data/manifest';
import { fileTypeModules } from '@/platform/app/data/fileTypes';
import { useSourceView } from '@/platform/core/source/useSourceView';
import { NotFound } from '@/platform/app/shell/App';
import type { Prototype } from '@/platform/app/data/types';
import type { FileTypeModule } from '@/platform/app/data/fileTypeModule';
const Source = import.meta.env.DEV ? lazy(() => import('@/platform/app/source/ArtifactSource')) : null;
const explanations: Record<string, string> = {
  Context: 'Product knowledge, personas, principles, and research that help people and agents understand this system.',
  Rules: 'Standing constraints for work using this system. System rules add product conventions while retaining platform boundaries.',
  Skills: 'Procedures for tasks specific to this system. Each skill describes when to use it and how to perform the task.',
};
export default function SystemContentPage({ proto, slug }: { proto: Prototype; slug?: string }) {
  const item = slug ? findArtifact(proto, slug) : undefined;
  const search = useSearch({ strict: false }) as { mode?: 'source' };
  const editing = import.meta.env.DEV && search.mode === 'source' && Boolean(item);
  const { toggle, rendered } = useSourceView(import.meta.env.DEV && Boolean(item), editing);
  const [loaded, setLoaded] = useState<{ type: FileTypeModule; props: object } | Error | null>(null);
  useEffect(() => {
    let active = true;
    setLoaded(null);
    if (!item || editing) return;
    const type = fileTypeModules[item.fileType];
    Promise.resolve(type.load({ proto, item })).then((props) => { if (active && props) setLoaded({ type, props }); }).catch((error: unknown) => { if (active) setLoaded(error instanceof Error ? error : new Error(String(error))); });
    return () => { active = false; };
  }, [proto, item, editing]);
  if (slug && !item) return <NotFound />;
  if (!item) return <div className="mx-auto w-full max-w-3xl px-8 py-10"><h1 className="text-3xl font-semibold">{proto.title}</h1><p className="mt-4 text-muted-foreground">{explanations[proto.title]}</p><p className="mt-4 text-sm">{proto.artifacts.length ? 'Select a file in navigation to read or edit it.' : 'No files yet. Ask your agent to add useful material, or use + in navigation locally.'}</p><p className="mt-4 text-sm text-muted-foreground">Agent instructions must point to the relevant files. Being listed here does not automatically load them into a conversation.</p></div>;
  if (editing) return Source && <Suspense fallback={null}><Source proto={proto} item={item} actions={<Button size="sm" variant="outline" onClick={toggle}>Done</Button>} /></Suspense>;
  if (loaded instanceof Error) return <p role="alert" className="p-8">{loaded.message}</p>;
  return <div ref={rendered} tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">{loaded ? <Suspense fallback={null}><loaded.type.Page {...loaded.props} /></Suspense> : <p className="p-8 text-sm">Loading…</p>}</div>;
}
