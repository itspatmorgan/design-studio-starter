import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { callModule, useMe } from '@/platform/app/data/files';
import { CONFIG } from '@/platform/app/data/config';
import { Button } from '@/systems/studio/components/button';
import { Input } from '@/systems/studio/components/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/systems/studio/components/dialog';

export default function NewSystemButton() {
  const me = useMe();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  if (!import.meta.env.DEV || !me || (CONFIG.usage !== 'personal' && !CONFIG.admins?.includes(me))) return null;
  async function create(form: FormData) {
    setSaving(true); setError('');
    try {
      const { id } = await callModule<{ id: string }>('systems', 'create', { name: String(form.get('name') ?? '') });
      // Registration changes the server's configuration; open the new system with fresh declarations.
      window.location.assign(`/systems/${encodeURIComponent(id)}`);
    } catch (e) { setError((e as Error).message); setSaving(false); }
  }
  return <><Button onClick={() => { setError(''); setOpen(true); }}><HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />New system</Button><Dialog open={open} onOpenChange={value => { if (!saving) setOpen(value); }}><DialogContent><form onSubmit={event => { event.preventDefault(); void create(new FormData(event.currentTarget)); }} className="grid gap-4"><DialogHeader><DialogTitle>New system</DialogTitle><DialogDescription>Create a place for your components, theme, assets, and guidance. Then set it up with your agent.</DialogDescription></DialogHeader><label className="grid gap-1.5 text-sm font-medium">Name<Input name="name" required maxLength={120} autoFocus placeholder="Your product" /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Creating' : 'Create'}</Button></DialogFooter></form></DialogContent></Dialog></>;
}
