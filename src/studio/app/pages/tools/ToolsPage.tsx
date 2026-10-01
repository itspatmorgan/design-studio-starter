// The Tools page: the mini apps the team maintains (src/tools/, see src/studio/tools.ts). Nothing is made
// here. A tool starts as a prototype and is published from its menu ("Publish as tool"), or from the
// button here, which lists your own prototypes. Open a tool and it fills the window like an app.
import { useState } from 'react';
import { getRouteApi, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wrench01Icon } from '@hugeicons/core-free-icons';
import { Card, CardContent } from '@/studio/components/card';
import { Button, buttonVariants } from '@/studio/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';
import { toast } from '@/studio/components/toast';
import { ContributorAvatar } from '@/studio/app/shell/ContributorAvatar';
import { publishTool, useMe } from '@/studio/app/data/files';
import { prototypeLink, setManifest } from '@/studio/app/data/manifest';
import type { PrototypeInfo } from '@/studio/app/data/types';
import { cn } from '@/lib/utils';

const rootApi = getRouteApi('__root__');

function ToolCard({ tool }: { tool: PrototypeInfo }) {
  const name = tool.contributor || tool.maintainers?.join(', ') || '';
  return (
    <Link {...prototypeLink(tool)} className="block">
      <Card className={cn('transition-colors hover:bg-muted/40', tool.status === 'archived' && 'opacity-60')}>
        <CardContent className="flex flex-col gap-2.5">
          <div className="flex h-7 items-center gap-2">
            <ContributorAvatar name={name || tool.title} />
            <span className="truncate text-xs font-medium text-muted-foreground" title={`Maintained by ${name}`}>{name.split(',')[0].split(' ')[0]}{(tool.maintainers?.length ?? 0) > 1 ? ` +${tool.maintainers!.length - 1}` : ''}</span>
          </div>
          <div className="text-sm font-semibold leading-snug text-foreground">{tool.title}</div>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{tool.description || 'No description'}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

// Pick one of your prototypes to publish as a tool, in dev.
function PublishDialog({ me, prototypes, open, onOpenChange }: { me: string; prototypes: PrototypeInfo[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const navigate = useNavigate();
  const [saving, setSaving] = useState<string | null>(null);
  const mine = prototypes.filter((p) => p.contributorKey === me && p.status !== 'archived');

  async function publish(p: PrototypeInfo) {
    setSaving(p.id);
    try {
      const result = await publishTool(p);
      setManifest(result.manifest);
      await router.invalidate();
      onOpenChange(false);
      navigate({ to: '/$contributor/$prototype', params: { contributor: result.contributor, prototype: result.id } });
      toast.add({ title: 'Published as a tool' });
      if (result.linkedFrom.length) toast.add({ type: 'error', title: `${result.linkedFrom.length === 1 ? 'A file links' : `${result.linkedFrom.length} files link`} to the old address and need updating: ${result.linkedFrom.slice(0, 2).join(', ')}${result.linkedFrom.length > 2 ? ', …' : ''}` });
    } catch (e) {
      toast.add({ type: 'error', title: (e as Error).message });
    } finally {
      setSaving(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish a prototype as a tool</DialogTitle>
          <DialogDescription>
            It moves to src/tools/ and you become its maintainer. People then use it as an app, from this page. Its address changes to /tools/….
          </DialogDescription>
        </DialogHeader>
        {mine.length ? (
          <ul className="grid max-h-72 gap-1 overflow-y-auto">
            {mine.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={saving !== null}
                  onClick={() => publish(p)}
                  className="flex w-full flex-col rounded-md px-3 py-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <span className="text-sm font-medium text-foreground">{saving === p.id ? 'Publishing…' : p.title}</span>
                  {p.description && <span className="line-clamp-1 text-xs text-muted-foreground">{p.description}</span>}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">You have no prototypes to publish yet. Start one with New tool prototype on the Prototypes page.</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// What the page says before any tool is published. Locally it explains how to make one; on the
// deployed site, where people only use tools, it says where they will appear.
function EmptyState({ local }: { local: boolean }) {
  return (
    <section className="flex flex-col items-center rounded-xl border border-dashed border-border px-8 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <HugeiconsIcon icon={Wrench01Icon} size={28} />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">No tools yet</h2>
      {local ? (
        <>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            A tool is a small app your team uses to make something, like a thumbnail or a branded graphic. Build it as a prototype first. When it's ready, publish it and it shows up here for everyone.
          </p>
          <ol className="mt-8 grid max-w-2xl gap-6 text-left sm:grid-cols-3">
            {[
              ['Start a tool prototype', 'Choose New tool prototype from the menu beside New prototype.'],
              ['Build it with your agent', "Describe what it makes and who uses it. It's a prototype until you publish it."],
              ['Publish it', 'Use Publish as tool in its … menu, or Publish a prototype… above.'],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-xs font-medium text-muted-foreground">{i + 1}</span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{body}</span>
                </span>
              </li>
            ))}
          </ol>
          <Link to="/" className={cn(buttonVariants({ variant: 'outline' }), 'mt-10')}>Go to Prototypes</Link>
        </>
      ) : (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">Tools your team publishes will show up here. Open one to use it.</p>
      )}
    </section>
  );
}

export default function ToolsPage() {
  const manifest = rootApi.useLoaderData();
  const me = useMe();
  const [publishing, setPublishing] = useState(false);
  const tools = [...manifest.tools].sort((a, b) => a.title.localeCompare(b.title));
  // Dev only (import.meta.env.DEV is false in the build), and only for contributors.
  const local = import.meta.env.DEV && me !== null;
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-12 pb-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tools</h1>
          <p className="mt-2 text-sm text-muted-foreground">Small apps the team maintains. Open one to use it.</p>
        </div>
        {local && (
          <>
            <Button variant="outline" onClick={() => setPublishing(true)}>
              <HugeiconsIcon icon={Wrench01Icon} data-icon="inline-start" /> Publish a prototype…
            </Button>
            <PublishDialog me={me} prototypes={manifest.prototypes} open={publishing} onOpenChange={setPublishing} />
          </>
        )}
      </header>
      {tools.length ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {tools.map((t) => <li key={t.id}><ToolCard tool={t} /></li>)}
        </ul>
      ) : (
        <EmptyState local={local} />
      )}
    </main>
  );
}
