// The Tools page: the mini apps the team maintains (src/tools/, see src/platform/tools.ts). Nothing is made
// here. A tool starts as a prototype and is published from its menu ("Publish as tool"), or from the
// button here, which lists your own prototypes. Open a tool and it fills the window like an app.
import { useState } from 'react';
import { getRouteApi, useNavigate, useRouter } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wrench01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/platform/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/platform/components/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/platform/components/select';
import { toast } from '@/platform/components/toast';
import { EmptyState } from '@/platform/app/shell/EmptyState';
import { ItemGrid } from '@/platform/app/items/ItemGrid';
import { useMe } from '@/platform/app/data/files';
import { prototypeLink, setManifest } from '@/platform/app/data/manifest';
import ToolCard from './ToolCard';
import { staleLinksMessage } from './staleLinks';
import { publishTool } from './actions';
import type { PrototypeInfo } from '@/platform/app/data/types';

const rootApi = getRouteApi('__root__');

// Pick one of your prototypes to publish as a tool, in dev.
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
      navigate(prototypeLink({ contributorKey: result.contributor, id: result.id }));
      toast.add({ title: 'Published as a tool' });
      if (result.linkedFrom.length) toast.add({ type: 'error', title: staleLinksMessage(result.linkedFrom) });
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
          <div className="grid gap-1.5">
            <label htmlFor="publish-prototype" className="text-sm font-medium text-foreground">Prototype</label>
            <Select items={mine.map((p) => ({ value: p.id, label: p.title }))} value={chosen} onValueChange={setChosen}>
              <SelectTrigger id="publish-prototype" className="w-full"><SelectValue placeholder="Choose a prototype" /></SelectTrigger>
              <SelectContent>
                {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You have no prototypes to publish yet. Start one with New prototype on the Prototypes page.</p>
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
        ['Start a prototype', 'Use New prototype on the Prototypes page.'],
        ['Build it', 'Tell your agent what it makes and who uses it.'],
        ['Publish it', 'Choose Publish as tool from its menu.'],
      ]}
    >
      A small app your team uses to make something, like a thumbnail or graphic. Build it as a prototype, then publish it here.
    </EmptyState>
  ) : (
    <EmptyState icon={Wrench01Icon} title="No tools yet">Tools your team publishes will show up here.</EmptyState>
  );
}

export default function ToolsPage() {
  const manifest = rootApi.useLoaderData();
  const me = useMe();
  const [publishing, setPublishing] = useState(false);
  const tools = [...(manifest.sections.tools ?? [])].sort((a, b) => a.title.localeCompare(b.title));
  // Dev only (import.meta.env.DEV is false in the build), and only for contributors.
  const local = import.meta.env.DEV && me !== null;
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-12 pb-8">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tools</h1>
        {/* The subtitle's line is as tall as the button (32px), so both centre their text on the same line. */}
        <div className="mt-0.5 flex items-center justify-between gap-4">
          <p className="text-sm leading-8 text-muted-foreground">Small apps your team maintains. Open one to use it.</p>
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
        <ItemGrid>
          {tools.map((t) => <li key={t.id}><ToolCard tool={t} /></li>)}
        </ItemGrid>
      ) : (
        <ToolsEmpty local={local} />
      )}
    </main>
  );
}
