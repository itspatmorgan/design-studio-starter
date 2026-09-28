import { Card, CardContent } from '@/studio/components/card';
import { ContributorAvatar } from '@/studio/components/avatar';
import { Input } from '@/studio/components/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { Link, navigate } from './navigate.jsx';

// A prototype opens on prototype.jsx (or .tsx), or its first view if there isn't one.
export function firstView(p) {
  return p.views.find((v) => /^prototype\.[jt]sx$/.test(v.name) && !v.group) ?? p.views[0];
}

// "2026-09-27" → "Sep 27, 2026"
export function formatDate(date) {
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

// Search box: filters by title, description, and contributor. The text lives in ?q=.
function SearchBox({ value }) {
  const set = (q) => navigate({ q }, { replace: true });
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="relative w-full max-w-xs">
      <HugeiconsIcon icon={Search01Icon} size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        inputMode="search"
        aria-label="Search prototypes"
        placeholder="Search prototypes..."
        value={value}
        onChange={(e) => set(e.target.value)}
        className={value ? 'px-9' : 'pl-9'}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => set('')}
          className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} />
        </button>
      )}
    </form>
  );
}

// Gray cards shaped like prototype cards, shown while the manifest loads.
function CardSkeletons({ count = 6 }) {
  const bar = 'rounded bg-muted';
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-4">
          <div className="flex h-7 items-center gap-2"><div className={`${bar} size-5 rounded-full`} /><div className={`${bar} h-3 w-16`} /></div>
          <div className={`${bar} h-4 w-3/4`} />
          <div className="space-y-1.5"><div className={`${bar} h-3 w-full`} /><div className={`${bar} h-3 w-2/3`} /></div>
          <div className={`${bar} h-3 w-20`} />
        </li>
      ))}
    </ul>
  );
}

const matches = (p, q) =>
  [p.title, p.description, p.contributor, p.contributorKey, p.id].some((f) => f?.toLowerCase().includes(q));

export default function Index({ manifest, search = '' }) {
  const q = search.trim().toLowerCase();
  let body;
  if (!manifest) body = <CardSkeletons />;
  else if (!manifest.prototypes.length) body = <p className="text-sm text-muted-foreground">No prototypes yet. Ask your agent to make one.</p>;
  else {
    // Newest first, by meta.json "created".
    const prototypes = manifest.prototypes
      .filter((p) => !q || matches(p, q))
      .sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''));
    body = prototypes.length ? (
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {prototypes.map((p) => (
          <li key={`${p.contributorKey}/${p.id}`}><PrototypeCard prototype={p} /></li>
        ))}
      </ul>
    ) : (
      <div className="py-16 text-center">
        <p className="mb-2 text-lg font-semibold text-foreground">Nothing here yet</p>
        <p className="mb-4 text-sm text-muted-foreground">Try a different search term.</p>
        <Link to={{}} className="text-sm text-primary hover:underline">View all prototypes</Link>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-12 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Prototypes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Every prototype in the sandbox, newest first.</p>
      </header>
      <div className="mb-6 flex"><SearchBox value={search} /></div>
      {body}
    </main>
  );
}
