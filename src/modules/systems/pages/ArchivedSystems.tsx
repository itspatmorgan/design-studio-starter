import { useState } from 'react';
import { callModule, useMe } from '@/platform/app/data/files';
import { CONFIG } from '@/platform/app/data/config';
import { Button } from '@/systems/studio/components/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/systems/studio/components/dialog';

type ArchivedSystem = { id: string; label: string; prototypes: number };
export default function ArchivedSystems() {
  const me = useMe();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ArchivedSystem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [restorePrototypes, setRestorePrototypes] = useState(true);
  if (!import.meta.env.DEV || !me || (CONFIG.usage !== 'personal' && !CONFIG.admins?.includes(me))) return null;
  async function load() {
    setOpen(true); setBusy(true); setError('');
    try { setItems((await callModule<{ items: ArchivedSystem[] }>('systems', 'action', { action: 'archived' })).items); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function restore(id: string) {
    setBusy(true); setError('');
    try {
      await callModule('systems', 'action', { action: 'restore', system: id, restorePrototypes });
      sessionStorage.setItem('studio:system-action', JSON.stringify({ title: 'System restored.' }));
      window.location.assign(`/systems/${id}`);
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }
  return <><Button variant="ghost" size="sm" className="mt-4" onClick={() => void load()}>Archived systems</Button><Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}><DialogContent><DialogHeader><DialogTitle>Archived systems</DialogTitle><DialogDescription>Archived systems and their files remain in the repository. Restore a system to use it again.</DialogDescription></DialogHeader>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{busy ? <p role="status" className="text-sm text-muted-foreground">Working</p> : items.length ? <><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={restorePrototypes} onChange={event => setRestorePrototypes(event.target.checked)} />Also restore prototypes archived with the system</label><ul className="grid gap-2">{items.map(item => <li key={item.id} className="flex items-center justify-between gap-4 rounded-md border p-3"><span className="text-sm">{item.label}<span className="block text-muted-foreground">{item.prototypes} {item.prototypes === 1 ? 'prototype' : 'prototypes'} archived together</span></span><Button variant="outline" size="sm" onClick={() => void restore(item.id)} aria-label={`Restore ${item.label}`}>Restore</Button></li>)}</ul></> : !error && <p className="text-sm text-muted-foreground">No archived systems.</p>}</DialogContent></Dialog></>;
}
