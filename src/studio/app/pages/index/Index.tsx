import { Card, CardContent } from '@/studio/components/card';
import { ContributorAvatar } from '@/studio/app/shell/ContributorAvatar';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/studio/components/input-group';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Layers01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { formatDate, newestFirst, prototypeLink } from '@/studio/app/data/manifest';
import type { PrototypeInfo } from '@/studio/app/data/types';
import { cn } from '@/lib/utils';
import NewPrototypeButton from '@/studio/app/pages/index/NewPrototypeDialog';
import { EmptyState } from '@/studio/app/shell/EmptyState';
import { useMe } from '@/studio/app/data/files';

const rootApi = getRouteApi('__root__');
const indexApi = getRouteApi('/');

function PrototypeCard({ prototype: p }: { prototype: PrototypeInfo }) {
  const name = p.contributor || p.contributorKey;
  return (
    <Link {...prototypeLink(p)} className="block">
      <Card className={cn('transition-colors hover:bg-muted/40', p.status === 'archived' && 'opacity-60')}>
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

const matches = (p: PrototypeInfo, q: string) =>
  [p.title, p.description, p.contributor, p.contributorKey, p.id].some((f) => f?.toLowerCase().includes(q));

export default function Index() {
  const manifest = rootApi.useLoaderData();
  const search = indexApi.useSearch().q ?? '';
  const q = search.trim().toLowerCase();
  // Only while the app runs locally, for contributors: the others can't make one.
  const me = useMe();
  const local = import.meta.env.DEV && me !== null;
  const empty = !manifest.prototypes.length;
  let body;
  if (empty) body = local ? (
    <EmptyState
      icon={Layers01Icon}
      title="No prototypes yet"
      steps={[
        ['Start one', 'Choose New prototype above, or ask your agent.'],
        ['Describe it', 'Tell your agent what it is for and who it is for.'],
        ['Share it', 'Every prototype has a link of its own.'],
      ]}
    >
      A prototype is a working sketch of an idea: real screens you can click through, kept in your own folder.
    </EmptyState>
  ) : (
    <EmptyState icon={Layers01Icon} title="No prototypes yet">Prototypes your team makes will show up here.</EmptyState>
  );
  else {
    // Newest first, by meta.json "created".
    const prototypes = manifest.prototypes
      .filter((p) => !q || matches(p, q))
      .sort(newestFirst);
    // Archived prototypes show here, below the rest. The deployed site leaves them out.
    const list = (ps: PrototypeInfo[]) => (
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {ps.map((p) => (
          <li key={`${p.contributorKey}/${p.id}`}><PrototypeCard prototype={p} /></li>
        ))}
      </ul>
    );
    const active = prototypes.filter((p) => p.status !== 'archived');
    const archived = prototypes.filter((p) => p.status === 'archived');
    body = prototypes.length ? (
      <>
        {active.length > 0 && list(active)}
        {archived.length > 0 && (
          <section className={active.length ? 'mt-10' : ''}>
            <h2 className="mb-1 text-sm font-semibold text-foreground">Archived</h2>
            <p className="mb-3 text-xs text-muted-foreground">Kept here for reference. The deployed site leaves these out.</p>
            {list(archived)}
          </section>
        )}
      </>
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
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Prototypes</h1>
        {/* The subtitle's line is as tall as the button (32px), so both centre their text on the same line. */}
        <div className="mt-0.5 flex items-center justify-between gap-4">
          <p className="text-sm leading-8 text-muted-foreground">Every prototype in the sandbox, newest first.</p>
          <NewPrototypeButton />
        </div>
      </header>
      {!empty && <div className="mb-6"><SearchBox value={search} /></div>}
      {body}
    </main>
  );
}
