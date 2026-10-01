// The Tools page: the mini apps the team maintains (src/tools/, see src/studio/tools.ts). Nothing is made
// here. A tool starts as a prototype and is published from its menu ("Publish as tool"), or from the
// button here, which lists your own prototypes. Open a tool and it fills the window like an app.
import { useState } from 'react';
import { getRouteApi, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wrench01Icon } from '@hugeicons/core-free-icons';
import { Card, CardContent } from '@/studio/components/card';
import { Button } from '@/studio/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/studio/components/command';
import { toast } from '@/studio/components/toast';
import { ContributorAvatar } from '@/studio/app/shell/ContributorAvatar';
import { EmptyState } from '@/studio/app/shell/EmptyState';
import { publishTool, useMe } from '@/studio/app/data/files';
import { prototypeLink, setManifest } from '@/studio/app/data/manifest';
import type { PrototypeInfo } from '@/studio/app/data/types';
import { cn } from '@/lib/utils';

const rootApi = getRouteApi('__root__');

function ToolCard({ tool }: { tool: PrototypeInfo }) {
  const name = tool.contributor || tool.maintainers?.join(', ') || '';
  return (
    <Link {...prototypeLink(tool)} className="block h-full">
      <Card className={cn('h-full transition-colors hover:bg-muted/40', tool.status === 'archived' && 'opacity-60')}>
        <CardContent className="flex flex-1 flex-col gap-2.5">
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

// Pick one of your prototypes to publish as a tool, in dev. A searchable list, since you may have many.
function PublishDialog({ me, prototypes, open, onOpenChange }: { me: string; prototypes: PrototypeInfo[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const navigate = useNavigate();
  const [chosen, setChosen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const mine = prototypes.filter((p) => p.contributorKey === me && p.status !== 'archived');
  const picked = mine.find((p) => p.id === chosen);

  async function publish(p: PrototypeInfo) {
    setSaving(true);
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
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setChosen(null); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish a prototype as a tool</DialogTitle>
          <DialogDescription>
            The team can then use it as an app. You become its maintainer.
          </DialogDescription>
        </DialogHeader>
        {mine.length ? (
          <Command className="border border-border">
            <CommandInput placeholder="Search your prototypes" />
            <CommandList className="max-h-56">
              <CommandEmpty>No prototypes match.</CommandEmpty>
              {mine.map((p) => (
                <CommandItem key={p.id} value={`${p.title} ${p.description} ${p.id}`} data-checked={chosen === p.id} onSelect={() => setChosen(p.id)}>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{p.title}</span>
                    {p.description && <span className="block truncate text-xs text-muted-foreground">{p.description}</span>}
                  </span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        ) : (
          <p className="text-sm text-muted-foreground">You have no prototypes to publish yet. Start one with New tool prototype on the Prototypes page.</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!picked || saving} onClick={() => picked && publish(picked)}>{saving ? 'Publishing…' : 'Publish'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// What the page says before any tool is published. Locally it explains how to make one; on the
// deployed site, where people only use tools, it says where they will appear.
function ToolsEmpty({ local }: { local: boolean }) {
  return local ? (
    <EmptyState
      icon={Wrench01Icon}
      title="No tools yet"
      steps={[
        ['Start a tool prototype', 'Use the menu beside New prototype.'],
        ['Build it', 'Tell your agent what it makes and who uses it.'],
        ['Publish it', 'Choose Publish as tool from its menu.'],
      ]}
    >
      A small app your team uses to make something, like a thumbnail or a graphic. Build it as a prototype, then publish it here.
    </EmptyState>
  ) : (
    <EmptyState icon={Wrench01Icon} title="No tools yet">Tools your team publishes will show up here.</EmptyState>
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
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tools</h1>
        {/* The subtitle's line is as tall as the button (32px), so both centre their text on the same line. */}
        <div className="mt-0.5 flex items-center justify-between gap-4">
          <p className="text-sm leading-8 text-muted-foreground">Small apps the team maintains. Open one to use it.</p>
          {local && (
            <>
              <Button variant="outline" onClick={() => setPublishing(true)}>
                <HugeiconsIcon icon={Wrench01Icon} data-icon="inline-start" /> Publish a prototype
              </Button>
              <PublishDialog me={me} prototypes={manifest.prototypes} open={publishing} onOpenChange={setPublishing} />
            </>
          )}
        </div>
      </header>
      {tools.length ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((t) => <li key={t.id}><ToolCard tool={t} /></li>)}
        </ul>
      ) : (
        <ToolsEmpty local={local} />
      )}
    </main>
  );
}
