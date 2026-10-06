import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { DesignSystem } from '@/platform/app/data/types';
import { NotFound } from '@/platform/app/shell/App';
import { PageHeader } from './foundations';
import { assetLink, systemAssets, type SystemAsset } from '../data/assets';

function FontPreview({ asset }: { asset: SystemAsset }) {
  const [family, setFamily] = useState<string>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFamily(undefined);
    setFailed(false);
    // A distinct family prevents preview fonts from replacing any system's typography.
    const name = `studio-asset-${crypto.randomUUID()}`;
    const font = new FontFace(name, `url(${JSON.stringify(asset.url)})`);
    let active = true;
    font.load().then(loaded => {
      if (active) { document.fonts.add(loaded); setFamily(name); }
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; document.fonts.delete(font); };
  }, [asset.url]);
  if (!family) return <p role="status" className="text-sm text-muted-foreground">{failed ? 'This font could not be previewed.' : 'Loading font'}</p>;
  return <div className="space-y-4 break-words" style={{ fontFamily: family }}>
    <p className="text-3xl">The quick brown fox jumps over the lazy dog.</p>
    <p className="text-lg">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789</p>
  </div>;
}

export default function SystemAssets({ system, sys, path }: { system: string; sys: DesignSystem; path?: string }) {
  const assets = systemAssets(system);
  if (path) {
    const asset = assets.find(item => item.path === path);
    if (!asset) return <NotFound />;
    return <>
      <Link to={`/systems/${system}/assets` as never} className="mb-4 inline-block text-sm hover:underline">All assets</Link>
      <PageHeader title={asset.path.split('/').pop()!} description={asset.path} />
      <div className="rounded-xl border border-border bg-muted/40 p-6">
        {asset.kind === 'Fonts' ? <FontPreview asset={asset} /> : <img src={asset.url} alt={asset.path} className="mx-auto max-h-[24rem] max-w-full object-contain" />}
      </div>
      <p className="mt-4 break-all text-xs text-muted-foreground">{`src/systems/${system}/assets/${asset.path}`}</p>
    </>;
  }
  return <>
    <PageHeader title="Assets" description={`Fonts, icons, and shared images owned by ${sys.label}.`} />
    <p className="mb-6 text-sm leading-6 text-foreground/80">Ask your agent to add your product’s fonts, icons, logos, and shared images to this system. Adding a file makes it available here; your theme and components choose how to use it.</p>
    {sys.icons && <section className="mb-6 rounded-xl bg-muted/40 p-6">
      <h2 className="mb-2 text-lg font-semibold">Icon library</h2>
      <p className="mb-3 text-sm text-muted-foreground">{sys.icons.library} supplies this system’s package icons.</p>
      <Link to={`/systems/${system}/icons` as never} className="text-sm hover:underline">Explore icons</Link>
    </section>}
    <div className="space-y-6">{(['Fonts', 'Icons', 'Images'] as const).map(kind => {
      const items = assets.filter(asset => asset.kind === kind);
      return <section key={kind}>
        <h2 className="mb-3 text-lg font-semibold">{kind}</h2>
        {items.length ? <ul className="space-y-2">{items.map(asset => <li key={asset.path}>
          <Link to={assetLink(system, asset.path) as never} className="flex items-center gap-4 rounded-lg border border-border px-4 py-3 hover:bg-muted">
            {kind !== 'Fonts' && <img src={asset.url} alt="" loading="lazy" className="size-10 shrink-0 object-contain" />}
            <span className="min-w-0 break-all text-sm">{asset.path}</span>
          </Link>
        </li>)}</ul> : <p className="text-sm text-muted-foreground">No local {kind.toLowerCase()} have been added.</p>}
      </section>;
    })}</div>
    <p className="mt-8 text-xs leading-5 text-muted-foreground">This browser shows local image and font files. Fonts and other assets provided by packages remain package dependencies; ask your agent to inspect those sources.</p>
  </>;
}
