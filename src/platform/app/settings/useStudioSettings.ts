import { useEffect, useState } from 'react';
import { useBlocker } from '@tanstack/react-router';
import type { StudioConfig } from '@/platform/core/config';

type Snapshot = {
  config: StudioConfig; version: string; actor: string | null; role: 'admin' | 'contributor' | null;
  contributors: { key: string; name: string; github: string }[];
  modules: { id: string; label: string; description?: string; optional: boolean; compatible: boolean }[];
  systems: { id: string; label: string; status: 'active' | 'archived' }[];
};


export function useStudioSettings(fields: readonly (keyof StudioConfig)[]) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [draft, setDraft] = useState<StudioConfig | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [conflict, setConflict] = useState(false);
  const dirty = Boolean(draft && snapshot && JSON.stringify(draft) !== JSON.stringify(snapshot.config));
  const blocker = useBlocker({ shouldBlockFn: () => dirty && !saving, enableBeforeUnload: () => dirty && !saving, withResolver: true });

  async function load() {
    setError('');
    try {
      const response = await fetch('/__studio/settings');
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setSnapshot(body); setDraft(body.config); setConflict(false); setRestarting(false);
      if (sessionStorage.getItem('studio:settings-saved')) { setSaved(true); sessionStorage.removeItem('studio:settings-saved'); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Settings could not load.'); }
  }
  useEffect(() => { void load(); }, []);
  const editable = snapshot?.role === 'admin';
  const disabled = !editable || saving || restarting;
  const update = (changes: Partial<StudioConfig>) => { setDraft((current) => current && { ...current, ...changes }); setSaved(false); };

  async function save() {
    if (!draft || !snapshot) return;
    setSaving(true); setError(''); setSaved(false);
    try {
      const changes = Object.fromEntries(fields.filter(key => JSON.stringify(draft[key]) !== JSON.stringify(snapshot.config[key])).map(key => [key, draft[key]]));
      const response = await fetch('/__studio/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base: snapshot.version, changes }),
      });
      const body = await response.json();
      if (!response.ok) { setConflict(response.status === 409); throw new Error(body.error); }
      setSnapshot({ ...snapshot, config: draft }); setSaved(true);
      if (body.restarting) { setRestarting(true); sessionStorage.setItem('studio:settings-saved', 'true'); }
      else await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Settings could not save.'); }
    finally { setSaving(false); }
  }

  const discard = () => { if (snapshot) setDraft(snapshot.config); setError(''); setConflict(false); };
  return { snapshot, draft, error, saving, restarting, saved, conflict, dirty, blocker, editable, disabled, update, save, load, discard };
}
