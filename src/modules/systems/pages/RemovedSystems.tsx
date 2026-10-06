import { useState } from 'react';
import { callModule, useMe } from '@/platform/app/data/files';
import { CONFIG } from '@/platform/app/data/config';
import { Button } from '@/systems/studio/components/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/systems/studio/components/dialog';

type RemovedSystem = { key: string; id: string; label: string };
export default function RemovedSystems() {
  const me = useMe();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<RemovedSystem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!import.meta.env.DEV || !me || (CONFIG.usage !== 'personal' && !CONFIG.admins?.includes(me))) return null;
  async function load() {
    setOpen(true); setBusy(true); setError('');
    try { setItems((await callModule<{ items: RemovedSystem[] }>('systems', 'action', { action: 'removed' })).items); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function restore(key: string) {
    setBusy(true); setError('');
    try {
      const { id } = await callModule<{ id: string }>('systems', 'action', { action: 'restore', key });
      window.location.assign(`/systems/${id}`);
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }
  return <><Button variant="ghost" size="sm" className="mt-4" onClick={() => void load()}>Removed systems</Button><Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}><DialogContent><DialogHeader><DialogTitle>Removed systems</DialogTitle><DialogDescription>Restore a system saved in this studio’s trash. Existing systems will be preserved.</DialogDescription></DialogHeader>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{busy ? <p role="status" className="text-sm text-muted-foreground">Working</p> : items.length ? <ul className="grid gap-2">{items.map(item => <li key={item.key} className="flex items-center justify-between gap-4 rounded-md border p-3"><span className="text-sm">{item.label}</span><Button variant="outline" size="sm" onClick={() => void restore(item.key)} aria-label={`Restore ${item.label}`}>Restore</Button></li>)}</ul> : !error && <p className="text-sm text-muted-foreground">No removed systems.</p>}</DialogContent></Dialog></>;
}
