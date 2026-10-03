import { Suspense, useContext, useEffect, useRef, useState } from 'react';
import { Link, getRouteApi } from '@tanstack/react-router';
import { DocBase } from '@/platform/app/docs/DocBase';
import { findItem, itemLink, loadPrototype } from '@/platform/app/data/manifest';
import { itemSlug } from '@/platform/core/fileTypes';
import { fileTypeModules } from '@/platform/app/data/fileTypes';
import type { Item, Prototype } from '@/platform/app/data/types';
import { fileReference } from './fileReference';
import { embedFor } from '@/platform/app/data/fileTypeModule';
import ItemCard from './ItemCard';
import { ErrorBoundary } from 'react-error-boundary';
import { FILE_TYPES } from '@/platform/app/data/fileTypes';

const rootApi = getRouteApi('__root__');
type Target = { proto: Prototype; item: Item };

export default function FileEmbed({ source, label = 'File' }: { source: string; label?: string }) {
  const base = useContext(DocBase);
  const manifest = rootApi.useLoaderData();
  const [target, setTarget] = useState<Target | null>(null);
  const [status, setStatus] = useState('Loading file…');
  const [width, setWidth] = useState(640);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(1, entry.contentRect.width)));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true;
    setTarget(null); setStatus('Loading file…');
    const reference = fileReference(source, base);
    if (!reference) { setStatus('Choose a file inside this prototype.'); return; }
    loadPrototype(reference.contributor, reference.prototype).then((proto) => {
      if (!active) return;
      const item = proto && findItem(proto, itemSlug(reference.path));
      if (!proto || !item || item.path !== reference.path) {
        setStatus('File unavailable. Check its path and whether its module is enabled.');
      } else setTarget({ proto, item });
    }, () => { if (active) setStatus('This file could not load.'); });
    return () => { active = false; };
  }, [source, base, manifest]);
  const Embed = target && embedFor(fileTypeModules[target.item.fileType], 'document');
  const height = Math.max(220, Math.min(440, width * 0.6));
  return <figure className="not-prose my-6 min-w-0 overflow-hidden rounded-lg border border-border bg-card">
    <figcaption className="border-b border-border bg-muted/60 px-4 py-2 text-sm">
      {target ? <Link {...itemLink(target.proto, target.item)} className="flex items-center justify-between gap-4 text-foreground hover:underline"><span className="truncate font-medium">{label}</span><span className="shrink-0 text-xs">Open {FILE_TYPES[target.item.fileType]?.label.toLowerCase() ?? 'file'} ↗</span></Link> : <span className="font-medium">{label}</span>}
    </figcaption>
    <div ref={container} className="min-w-0" style={{ height: target && !Embed ? 88 : height }}>
      {target ? (Embed ? <div className="h-full" style={{ pointerEvents: 'none' }}><ErrorBoundary resetKeys={[source]} fallback={<p role="alert" className="p-4 text-sm">This preview could not render. Open the file to inspect it.</p>}><Suspense fallback={<p role="status" className="p-4 text-sm">Loading preview…</p>}><Embed proto={target.proto} item={target.item} width={width} height={height} /></Suspense></ErrorBoundary></div> : <ItemCard proto={target.proto} item={target.item} />) : <p role="status" className="p-4 text-sm text-muted-foreground">{status}</p>}
    </div>
  </figure>;
}
