import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/platform/components/input-group';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Layers01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { getRouteApi, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { newestFirst } from '@/platform/app/data/manifest';
import type { PrototypeInfo } from '@/platform/app/data/types';
import { cn } from '@/lib/utils';
import { Collection, ViewToggle } from '@/platform/app/items/Collection';
import NewPrototypeButton from '@/platform/modules/prototypes/gallery/NewPrototypeDialog';
import PrototypeCard, { PrototypeRow } from './PrototypeCard';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/platform/components/empty';
import { useMe } from '@/platform/app/data/files';

const rootApi = getRouteApi('__root__');

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
    <Empty className="border border-dashed py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon"><HugeiconsIcon icon={Layers01Icon} /></EmptyMedia>
        <EmptyTitle>No prototypes yet</EmptyTitle>
        <EmptyDescription>A working sketch of an idea: real screens you can click through.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ) : (
    <Empty className="border border-dashed py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon"><HugeiconsIcon icon={Layers01Icon} /></EmptyMedia>
        <EmptyTitle>No prototypes yet</EmptyTitle>
        <EmptyDescription>Prototypes your team makes will show up here.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
  else {
    // Newest first, by meta.json "created".
    const prototypes = manifest.prototypes
      .filter((p) => !q || matches(p, q))
      .sort(newestFirst);
    // Archived prototypes show here, below the rest. The deployed site leaves them out.
    const list = (ps: PrototypeInfo[]) => (
      <Collection items={ps} keyOf={(p) => `${p.contributorKey}/${p.id}`} card={(p) => <PrototypeCard prototype={p} />} row={(p) => <PrototypeRow prototype={p} />} />
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
            {!empty && <ViewToggle />}
            <NewPrototypeButton />
          </div>
        </div>
      </header>
      {body}
    </main>
  );
}
