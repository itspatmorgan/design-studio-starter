import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, FileEditIcon, Folder01Icon, Link01Icon, Archive02Icon, MoreHorizontalIcon, PencilEdit02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { callModule, useMe } from '@/platform/app/data/files';
import { CONFIG } from '@/platform/app/data/config';
import { useManifest } from '@/platform/app/data/useManifest';
import { prototypeLink } from '@/platform/app/data/manifest';
import { Button } from '@/systems/studio/components/button';
import { Input } from '@/systems/studio/components/input';
import { toast } from '@/systems/studio/components/toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/systems/studio/components/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/systems/studio/components/dropdown-menu';
import { DEFAULT_SYSTEM, SYSTEM_SPECS } from '../data/systems';

export const systemRequest = <T,>(action: string, system?: string, extra: object = {}) => callModule<T>('systems', 'action', { action, system, ...extra });

export default function SystemMenu({ system }: { system: string }) {
  const navigate = useNavigate();
  const manifest = useManifest();
  const me = useMe();
  const spec = SYSTEM_SPECS[system];
  const local = import.meta.env.DEV && !!me;
  const admin = local && (CONFIG.usage === 'personal' || CONFIG.admins?.includes(me!));
  const editable = admin && spec.role === 'prototype';
  const [dialog, setDialog] = useState<'rename' | 'archive' | 'restore' | 'delete' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const dependents = [...manifest.prototypes, ...Object.values(manifest.sections).flat()].filter(proto => proto.system === system || proto.rebuild?.targetSystem === system);

  async function run(action: string) {
    try {
      const result = await systemRequest<{ message?: string }>(action, system);
      if (action === 'default') window.location.assign(`/systems/${system}`);
      else if (result.message) toast.add({ title: result.message });
    } catch (e) { toast.add({ type: 'error', title: (e as Error).message }); }
  }
  async function openAction(action: 'archive' | 'restore' | 'delete') {
    setDialog(action); setError(''); setAllowed(false); setChecking(true);
    try { await systemRequest(`${action}-check`, system); setAllowed(true); }
    catch (e) { setError((e as Error).message); }
    finally { setChecking(false); }
  }
  async function save(name?: string, restorePrototypes = false) {
    setBusy(true); setError('');
    try {
      const action = dialog!;
      // Keep reloads during a folder move or deletion on a stable route.
      await navigate({ to: '/systems' as never });
      const result = await systemRequest<{ id: string; references: number }>(action, system, { name, restorePrototypes });
      sessionStorage.setItem('studio:system-action', JSON.stringify({ title: action === 'rename' ? 'System renamed. References updated.' : action === 'archive' ? 'System and associated prototypes archived.' : action === 'restore' ? 'System restored.' : 'System deleted. Associated prototypes need a rebuild.' }));
      window.location.assign(action === 'delete' || action === 'archive' ? '/systems' : `/systems/${result.id}`);
    } catch (e) {
      toast.add({ type: 'error', title: (e as Error).message });
      setError((e as Error).message);
      setBusy(false);
    }
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(new URL(`/systems/${system}`, location.origin).href); toast.add({ title: 'Link copied' }); }
    catch { toast.add({ type: 'error', title: 'Could not copy the link.' }); }
  }
  return <>
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`Actions for ${spec.label}`} className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
        <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {local && <><DropdownMenuItem onClick={() => void run('open')}><HugeiconsIcon icon={FileEditIcon} />Open in editor</DropdownMenuItem><DropdownMenuItem onClick={() => void run('reveal')}><HugeiconsIcon icon={Folder01Icon} />Reveal in Finder</DropdownMenuItem></>}
        <DropdownMenuItem onClick={() => void copyLink()}><HugeiconsIcon icon={Link01Icon} />Copy link</DropdownMenuItem>
        {editable && <><DropdownMenuSeparator /><DropdownMenuItem onClick={() => setTimeout(() => { setError(''); setDialog('rename'); })}><HugeiconsIcon icon={PencilEdit02Icon} />Rename</DropdownMenuItem><DropdownMenuItem disabled={system === DEFAULT_SYSTEM || spec.status === 'archived'} onClick={() => void run('default')}><HugeiconsIcon icon={Tick02Icon} />{system === DEFAULT_SYSTEM ? 'Default system' : 'Set as default'}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => setTimeout(() => void openAction(spec.status === 'archived' ? 'restore' : 'archive'))}><HugeiconsIcon icon={Archive02Icon} />{spec.status === 'archived' ? 'Restore system' : 'Archive system'}</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => setTimeout(() => void openAction('delete'))}><HugeiconsIcon icon={Delete02Icon} />Delete system</DropdownMenuItem></>}
      </DropdownMenuContent>
    </DropdownMenu>
    <Dialog open={dialog !== null} onOpenChange={value => { if (!value && !busy) setDialog(null); }}>
      <DialogContent showCloseButton={!busy}>
        {dialog === 'rename' ? <form className="grid gap-4" onSubmit={event => { event.preventDefault(); void save(String(new FormData(event.currentTarget).get('name') ?? '')); }}>
          <DialogHeader><DialogTitle>Rename system</DialogTitle><DialogDescription>Enter the new name.</DialogDescription></DialogHeader>
          <label className="grid gap-1.5 text-sm font-medium">Name<Input name="name" defaultValue={spec.label} required maxLength={120} autoFocus /></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => setDialog(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving' : 'Save'}</Button></DialogFooter>
        </form> : <>
          <DialogHeader><DialogTitle>{dialog === 'archive' ? 'Archive' : dialog === 'restore' ? 'Restore' : 'Delete'} {spec.label}?</DialogTitle><DialogDescription>{dialog === 'archive' ? 'This system and its associated active prototypes will be archived. Their files stay in the repository and are excluded from deployment. This system will no longer be available for new prototypes.' : dialog === 'restore' ? 'Make this system available for new prototypes again. Choose whether to restore the prototypes archived with it.' : 'Permanently delete this system’s source files and registration. Associated prototypes keep their files but cannot render or deploy until rebuilt with another system. There is no Studio recovery copy. Uncommitted system files cannot be recovered through Git.'}</DialogDescription></DialogHeader>
          {checking && <p role="status" className="text-sm text-muted-foreground">Checking system dependencies</p>}
          {error && <p role="alert" className="text-sm text-destructive whitespace-pre-line">{error}</p>}
          {dependents.length > 0 && <div className="grid gap-2 text-sm"><p>These prototypes depend on {spec.label}.</p><ul className="max-h-48 list-disc overflow-auto pl-5">{dependents.map(proto => <li key={`${proto.contributorKey}/${proto.id}`}><Link {...prototypeLink(proto)} className="underline">{proto.title}</Link>{proto.status === 'archived' ? ' (archived)' : ''}{proto.rebuild?.targetSystem === system ? ' (pending rebuild)' : ''}</li>)}</ul></div>}
          <DialogFooter><Button variant="outline" disabled={busy} onClick={() => setDialog(null)}>Cancel</Button>{dialog === 'restore' && <Button disabled={busy || checking || !allowed} onClick={() => void save(undefined, true)}>Restore system and prototypes</Button>}<Button variant={dialog === 'restore' ? 'outline' : 'destructive'} disabled={busy || checking || !allowed} onClick={() => void save(undefined, false)}>{busy ? 'Working' : dialog === 'archive' ? 'Archive system' : dialog === 'restore' ? 'Restore system only' : 'Delete system'}</Button></DialogFooter>
        </>}
      </DialogContent>
    </Dialog>
  </>;
}
