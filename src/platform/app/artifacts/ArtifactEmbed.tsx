import { Suspense, useContext, useEffect, useRef, useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { DocBase } from '@/platform/app/docs/DocBase';
import { findArtifact, loadPrototype } from '@/platform/app/data/manifest';
import { artifactSlug } from '@/platform/core/fileTypes';
import { fileTypeModules } from '@/platform/app/data/fileTypes';
import type { Artifact, Prototype } from '@/platform/app/data/types';
import { artifactReference } from './artifactReference';
import { embedFor } from '@/platform/app/data/fileTypeModule';
import ArtifactCard from './ArtifactCard';
import { ErrorBoundary } from 'react-error-boundary';
import EmbedFrame from './EmbedFrame';

const rootApi = getRouteApi('__root__');
type Target = { proto: Prototype; item: Artifact };

export default function ArtifactEmbed({ source, label = 'Artifact' }: { source: string; label?: string }) {
  const base = useContext(DocBase);
  const manifest = rootApi.useLoaderData();
  const [target, setTarget] = useState<Target | null>(null);
  const [status, setStatus] = useState('Loading artifact…');
  const [width, setWidth] = useState(640);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(1, entry.contentRect.width)));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true;
    setTarget(null); setStatus('Loading artifact…');
    const reference = artifactReference(source, base);
    if (!reference) { setStatus('Choose a file inside this prototype.'); return; }
    loadPrototype(reference.contributor, reference.prototype).then((proto) => {
      if (!active) return;
      const item = proto && findArtifact(proto, artifactSlug(reference.path));
      if (!proto || !item || item.path !== reference.path) {
        setStatus('File unavailable. Check its path and whether its module is enabled.');
      } else setTarget({ proto, item });
    }, () => { if (active) setStatus('This file could not load.'); });
    return () => { active = false; };
  }, [source, base, manifest]);
  const Embed = target && embedFor(fileTypeModules[target.item.fileType], 'document');
  const height = Math.max(220, Math.min(440, width * 0.6));
  return <figure className="not-prose my-6 min-w-0">
    <EmbedFrame proto={target?.proto} item={target?.item} label={label}>
    <div ref={container} className="min-w-0" style={{ height: target && !Embed ? 88 : height }}>
      {target ? (Embed ? <div inert className="h-full" style={{ pointerEvents: 'none' }}><ErrorBoundary resetKeys={[source]} fallback={<p role="alert" className="p-4 text-sm">This preview could not render. Open the file to inspect it.</p>}><Suspense fallback={<p role="status" className="p-4 text-sm">Loading preview…</p>}><Embed proto={target.proto} item={target.item} width={width} height={height} /></Suspense></ErrorBoundary></div> : <ArtifactCard proto={target.proto} item={target.item} />) : <p role="status" className="p-4 text-sm text-muted-foreground">{status}</p>}
    </div>
    </EmbedFrame>
  </figure>;
}
