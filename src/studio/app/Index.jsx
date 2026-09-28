import { Card, CardContent } from '@/studio/components/card';
import { ContributorAvatar } from '@/studio/components/avatar';
import { Link } from './navigate.jsx';

// A prototype opens on prototype.jsx, or its first view if there isn't one.
export function firstView(p) {
  return p.views.find((v) => v.name === 'prototype.jsx' && !v.group) ?? p.views[0];
}

// "2026-09-27" → "Sep 27, 2026"
function formatDate(date) {
  if (!date) return '';
  const d = new Date(`${date}T00:00:00`);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PrototypeCard({ prototype: p }) {
  const v = firstView(p);
  const name = p.contributor || p.contributorKey;
  return (
    <Link to={{ contributor: p.contributorKey, prototype: p.id, group: v?.group, view: v?.name }} className="block">
      <Card className="gap-0 rounded-lg border py-0 shadow-sm ring-0 transition-colors hover:border-foreground/20 hover:bg-muted/40 hover:shadow-md">
        <CardContent className="flex flex-col gap-2.5 p-4">
          <div className="flex h-7 items-center gap-2">
            <ContributorAvatar name={name} size={20} />
            <span className="truncate text-xs font-medium text-muted-foreground">{name.split(' ')[0]}</span>
          </div>
          <div className="text-sm font-semibold leading-snug text-foreground">{p.title}</div>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.description || 'No description'}</p>
          <span className="text-xs text-muted-foreground">{formatDate(p.created)}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Index({ manifest }) {
  let body;
  if (!manifest) body = <p className="text-sm text-muted-foreground">Loading…</p>;
  else if (!manifest.prototypes.length) body = <p className="text-sm text-muted-foreground">No prototypes yet. Ask your agent to make one.</p>;
  else {
    // Newest first, by meta.json "created".
    const prototypes = [...manifest.prototypes].sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''));
    body = (
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {prototypes.map((p) => (
          <li key={`${p.contributorKey}/${p.id}`}><PrototypeCard prototype={p} /></li>
        ))}
      </ul>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-12 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Prototypes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Every prototype in the sandbox, newest first.</p>
      </header>
      {body}
    </main>
  );
}
