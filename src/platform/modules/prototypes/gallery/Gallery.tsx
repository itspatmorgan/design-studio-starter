import { Card, CardContent } from '@/platform/components/card';
import { ContributorAvatar } from '@/platform/app/shell/ContributorAvatar';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/platform/components/input-group';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Layers01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { getRouteApi, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { formatDate, newestFirst, prototypeLink } from '@/platform/app/data/manifest';
import type { PrototypeInfo } from '@/platform/app/data/types';
import { cn } from '@/lib/utils';
import { ItemGrid } from '@/platform/app/items/ItemGrid';
import NewPrototypeButton from '@/platform/modules/prototypes/gallery/NewPrototypeDialog';
import PrototypeCardMenu from '@/platform/modules/prototypes/gallery/PrototypeCardMenu';
import { EmptyState } from '@/platform/app/shell/EmptyState';
import { useMe } from '@/platform/app/data/files';

const rootApi = getRouteApi('__root__');

function PrototypeCard({ prototype: p }: { prototype: PrototypeInfo }) {
  const name = p.contributor || p.contributorKey;
  return (
    <div className="group/card-wrap relative h-full">
      <Link {...prototypeLink(p)} className="block h-full">
        <Card className={cn('h-full transition-colors hover:bg-muted/40', p.status === 'archived' && 'opacity-60')}>
          <CardContent className="flex flex-1 flex-col gap-2.5">
            <div className="flex h-7 items-center gap-2">
              <ContributorAvatar name={name} />
              <span className="truncate text-xs font-medium text-muted-foreground">{name.split(' ')[0]}</span>
            </div>
            <div className="text-sm font-semibold leading-snug text-foreground">{p.title}</div>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.description || 'No description'}</p>
            <span className="mt-auto pt-0.5 text-xs text-muted-foreground">{formatDate(p.created)}</span>
          </CardContent>
        </Card>
      </Link>
      <PrototypeCardMenu proto={p} />
    </div>
  );
}

// Search box: filters by title, description, and contributor. The text lives in ?q=. It's short until
// you use it, then widens: while it's focused, and while it holds a search.
function SearchBox({ value }: { value: string }) {
  const navigate = useNavigate();
  // replace: typing doesn't add a history entry per keystroke. (The gallery's route is added by the module,
  // so the router's types don't know it: it's written loosely.)
  const set = (q: string) => navigate({ to: '.', search: { q: q || undefined } as never, replace: true });
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={cn('shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none', value ? 'w-64' : 'w-36 focus-within:w-64')}
    >
      <InputGroup>
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} />
        </InputGroupAddon>
        <InputGroupInput
          name="q"
          inputMode="search"
          aria-label="Search prototypes"
          placeholder="Search"
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

export default function Gallery() {
  const manifest = rootApi.useLoaderData();
  const search = (useSearch({ strict: false }) as { q?: string }).q ?? '';
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
        ['Start one', 'Use New prototype above, or ask your agent.'],
        ['Describe it', 'Tell your agent what it is and who it is for.'],
        ['Share it', 'Each one has a link of its own.'],
      ]}
    >
      A working sketch of an idea: real screens you can click through.
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
      <ItemGrid>
        {ps.map((p) => (
          <li key={`${p.contributorKey}/${p.id}`}><PrototypeCard prototype={p} /></li>
        ))}
      </ItemGrid>
    );
    const active = prototypes.filter((p) => p.status !== 'archived');
    const archived = prototypes.filter((p) => p.status === 'archived');
    body = prototypes.length ? (
      <>
        {active.length > 0 && list(active)}
        {archived.length > 0 && (
          <section className={active.length ? 'mt-10' : ''}>
            <h2 className="mb-1 text-sm font-semibold text-foreground">Archived</h2>
            <p className="mb-3 text-xs text-muted-foreground">Left out of the deployed site.</p>
            {list(archived)}
          </section>
        )}
      </>
    ) : (
      <div className="py-16 text-center">
        <p className="mb-2 text-lg font-semibold text-foreground">No matches</p>
        <p className="mb-4 text-sm text-muted-foreground">Try a different search.</p>
        <Link to={'/prototypes' as never} className="text-sm text-primary hover:underline">View all prototypes</Link>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-12 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Prototypes</h1>
        {/* The subtitle's line is as tall as the controls (32px), so all of them centre on the same line. */}
        <div className="mt-0.5 flex items-center justify-between gap-4">
          <p className="min-w-0 truncate text-sm leading-8 text-muted-foreground">All prototypes, newest first.</p>
          <div className="flex shrink-0 items-center gap-2">
            {!empty && <SearchBox value={search} />}
            <NewPrototypeButton />
          </div>
        </div>
      </header>
      {body}
    </main>
  );
}
