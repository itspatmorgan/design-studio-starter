import { useContext, useEffect, useRef, useState } from 'react';
import { Link, getRouteApi } from '@tanstack/react-router';
import { DocBase } from '@/platform/app/docs/DocBase';
import { findItem, itemLink, loadPrototype } from '@/platform/app/data/manifest';
import { itemSlug } from '@/platform/core/fileTypes';
import { fileTypeModules } from '@/platform/app/data/fileTypes';
import type { Item, Prototype } from '@/platform/app/data/types';
import { diagramReference } from './diagramReference';

const rootApi = getRouteApi('__root__');
type Target = { proto: Prototype; item: Item };

export default function DiagramFileEmbed({ source, label = 'Diagram' }: { source: string; label?: string }) {
  const base = useContext(DocBase);
  const manifest = rootApi.useLoaderData();
  const [target, setTarget] = useState<Target | null>(null);
  const [status, setStatus] = useState('Loading diagram…');
  const [width, setWidth] = useState(640);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(1, entry.contentRect.width)));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true;
    setTarget(null); setStatus('Loading diagram…');
    const reference = diagramReference(source, base);
    if (!reference) { setStatus('Choose a diagram file inside this prototype.'); return; }
    loadPrototype(reference.contributor, reference.prototype).then((proto) => {
      if (!active) return;
      const item = proto && findItem(proto, itemSlug(reference.path));
      if (!proto || !item || item.path !== reference.path || !fileTypeModules[item.fileType]?.Embed) {
        setStatus('Diagram unavailable. Check the file path and whether Diagrams is enabled.');
      } else setTarget({ proto, item });
    }, () => { if (active) setStatus('This diagram could not load.'); });
    return () => { active = false; };
  }, [source, base, manifest]);
  const Embed = target && fileTypeModules[target.item.fileType]?.Embed;
  const height = Math.max(220, Math.min(440, width * 0.6));
  return <figure className="not-prose my-6 min-w-0 overflow-hidden rounded-lg border border-border bg-card">
    <figcaption className="border-b border-border bg-muted/60 px-4 py-2 text-sm">
      {target ? <Link {...itemLink(target.proto, target.item)} className="flex items-center justify-between gap-4 text-foreground hover:underline"><span className="truncate font-medium">{label}</span><span className="shrink-0 text-xs">Open diagram ↗</span></Link> : <span className="font-medium">{label}</span>}
    </figcaption>
    <div ref={container} className="min-w-0" style={{ height }}>
      {target && Embed ? <Embed proto={target.proto} item={target.item} width={width} height={height} /> : <p role="status" className="p-4 text-sm text-muted-foreground">{status}</p>}
    </div>
  </figure>;
}
