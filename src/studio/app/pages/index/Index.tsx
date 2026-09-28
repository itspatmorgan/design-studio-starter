import { Card, CardContent } from '@/studio/components/card';
import { ContributorAvatar } from '@/studio/app/shell/ContributorAvatar';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/studio/components/input-group';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { formatDate, newestFirst, prototypeLink } from '@/studio/app/data/manifest';
import type { Prototype } from '@/studio/app/data/types';

const rootApi = getRouteApi('__root__');
const indexApi = getRouteApi('/');

function PrototypeCard({ prototype: p }: { prototype: Prototype }) {
  const name = p.contributor || p.contributorKey;
  return (
    <Link {...prototypeLink(p)} className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardContent className="flex flex-col gap-2.5">
          <div className="flex h-7 items-center gap-2">
            <ContributorAvatar name={name} />
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
function SearchBox({ value }: { value: string }) {
  const navigate = useNavigate({ from: '/' });
  // replace: typing doesn't add a history entry per keystroke.
  const set = (q: string) => navigate({ search: { q: q || undefined }, replace: true });
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="w-full max-w-xs">
      <InputGroup>
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} />
        </InputGroupAddon>
        <InputGroupInput
          name="q"
          inputMode="search"
          aria-label="Search prototypes"
          placeholder="Search prototypes..."
          value={value}
          onChange={(e) => set(e.target.value)}
        />
        {value && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => set('')}>
              <HugeiconsIcon icon={Cancel01Icon} />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </form>
  );
}

const matches = (p: Prototype, q: string) =>
  [p.title, p.description, p.contributor, p.contributorKey, p.id].some((f) => f?.toLowerCase().includes(q));

export default function Index() {
  const manifest = rootApi.useLoaderData();
  const search = indexApi.useSearch().q ?? '';
  const q = search.trim().toLowerCase();
  let body;
  if (!manifest.prototypes.length) body = <p className="text-sm text-muted-foreground">No prototypes yet. Ask your agent to make one.</p>;
  else {
    // Newest first, by meta.json "created".
    const prototypes = manifest.prototypes
      .filter((p) => !q || matches(p, q))
      .sort(newestFirst);
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
        <Link to="/" className="text-sm text-primary hover:underline">View all prototypes</Link>
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
