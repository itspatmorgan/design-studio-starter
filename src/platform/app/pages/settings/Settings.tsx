import { useEffect, useState, type ReactNode } from 'react';
import { Link, useBlocker } from '@tanstack/react-router';
import { Button } from '@/systems/studio/components/button';
import { Input } from '@/systems/studio/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/systems/studio/components/select';
import { Switch } from '@/systems/studio/components/switch';
import { Checkbox } from '@/systems/studio/components/checkbox';
import { Label } from '@/systems/studio/components/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/systems/studio/components/dialog';
import { Badge } from '@/systems/studio/components/badge';
import { Alert, AlertTitle, AlertDescription } from '@/systems/studio/components/alert';
import { Card, CardHeader, CardContent, CardDescription } from '@/systems/studio/components/card';
import { adminProblems, type StudioConfig } from '@/platform/core/config';

type Snapshot = {
  config: StudioConfig; version: string; actor: string | null; role: 'admin' | 'contributor' | null;
  contributors: { key: string; name: string; github: string }[];
  modules: { id: string; label: string; description?: string; optional: boolean; compatible: boolean }[];
  systems: { id: string; label: string }[];
};

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-title`}>
    <Card className="[--card-spacing:var(--spacing-6)]">
      <CardHeader><h2 id={`${id}-title`} className="text-base font-semibold">{title}</h2><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </section>;
}

export default function Settings() {
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
      const { name, tagline, usage, defaultSystem, modules, admins } = draft;
      const response = await fetch('/__studio/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base: snapshot.version, changes: { name, tagline: tagline ?? '', usage, defaultSystem, modules, admins: admins ?? [] } }),
      });
      const body = await response.json();
      if (!response.ok) { setConflict(response.status === 409); throw new Error(body.error); }
      setSnapshot({ ...snapshot, config: draft }); setSaved(true);
      if (body.restarting) { setRestarting(true); sessionStorage.setItem('studio:settings-saved', 'true'); }
      else await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Settings could not save.'); }
    finally { setSaving(false); }
  }

  return <main className="mx-auto w-full max-w-3xl shrink-0 space-y-6 px-4 py-8 sm:px-8 sm:py-10">
    <header className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold tracking-tight">Studio settings</h1>
        {snapshot && <Badge variant="secondary">{snapshot.role === 'admin' ? 'Admin' : snapshot.role === 'contributor' ? 'Contributor' : 'Not registered'}</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">Configure your studio, choose its capabilities, and see who contributes.</p>
    </header>
    {error && <Alert variant="destructive" className="space-y-3 p-4">
      <p className="whitespace-pre-line">{error}</p><Button variant="outline" onClick={() => { if (!dirty || window.confirm('Discard unsaved settings and reload?')) void load(); }}>Reload settings</Button>
    </Alert>}
    {saved && <Alert role="status" className="p-4">Settings saved. {sessionStorage.getItem('studio:settings-saved') ? 'The studio is restarting to apply your changes.' : 'Your changes are applied locally.'}</Alert>}
    {!snapshot || !draft ? (!error && <p role="status" className="text-sm text-muted-foreground">Loading settings</p>) : <>
      {!editable && <Alert role="note" className="p-4">{snapshot.role ? 'You can view these settings. An Admin can change them.' : 'Ask your agent to register your contributor identity before editing settings.'}</Alert>}
      <Alert role="note" className="p-4">
        <AlertTitle>Settings are shared through Git</AlertTitle>
        <AlertDescription>Changes save to your local repository. Share them through your team’s Git workflow.</AlertDescription>
      </Alert>
      <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); void save(); }}>
        <Section id="general" title="General" description="The shared identity and defaults for your studio.">
          <fieldset disabled={disabled} className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="studio-name">Studio name</Label><Input id="studio-name" value={draft.name} required onChange={(event) => update({ name: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="studio-use">Studio use</Label>
              <Select items={[{ value: 'personal', label: 'Personal' }, { value: 'team', label: 'Team' }]} value={draft.usage} disabled={disabled} onValueChange={(value) => { if (value) update({ usage: value as StudioConfig['usage'] }); }}>
                <SelectTrigger id="studio-use" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="personal">Personal</SelectItem><SelectItem value="team">Team</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="studio-tagline">Tagline</Label><Input id="studio-tagline" aria-describedby="tagline-description" value={draft.tagline ?? ''} maxLength={140} onChange={(event) => update({ tagline: event.target.value })} /><p id="tagline-description" className="text-xs text-muted-foreground">An optional introduction on the published Home. Up to 140 characters.</p></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="default-system">Default design system</Label>
              <Select items={snapshot.systems.map((system) => ({ value: system.id, label: system.label }))} value={draft.defaultSystem} disabled={disabled} onValueChange={(value) => { if (value) update({ defaultSystem: value }); }}>
                <SelectTrigger id="default-system" aria-describedby="system-description" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{snapshot.systems.map((system) => <SelectItem key={system.id} value={system.id}>{system.label}</SelectItem>)}</SelectContent>
              </Select>
              <p id="system-description" className="text-xs text-muted-foreground">Existing prototypes keep their current system when you change this default.</p>
            </div>
          </fieldset>
        </Section>
        <Section id="modules" title="Modules" description="Turn optional capabilities on or off. Disabling a module keeps its files and content.">
          <div className="divide-y divide-border">{snapshot.modules.map((module) => <div key={module.id} className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0"><Label htmlFor={`module-${module.id}`}>{module.label} <span className="font-normal text-muted-foreground">({module.optional ? 'Optional' : 'Required'})</span></Label><p id={`module-${module.id}-description`} className="mt-2 text-sm text-muted-foreground">{module.description}</p>{!module.compatible && <p className="mt-1 text-sm text-destructive">Incompatible with this platform</p>}</div>
            <Switch id={`module-${module.id}`} aria-describedby={`module-${module.id}-description`} checked={draft.modules[module.id]} disabled={disabled || !module.optional || (!module.compatible && !draft.modules[module.id])} onCheckedChange={(checked) => update({ modules: { ...draft.modules, [module.id]: checked } })} />
          </div>)}</div>
        </Section>
        <Section id="contributors" title="Contributors" description={draft.usage === 'personal' ? 'In personal use, your local contributor automatically has Admin capabilities.' : 'Contributors own their prototypes. Admins also manage shared settings. Choose at least one Admin.'}>
          <ul className="divide-y divide-border">{snapshot.contributors.map((person) => {
            const admin = draft.usage === 'personal' ? person.key === snapshot.actor : draft.admins?.includes(person.key);
            return <li key={person.key} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
              <div><Link to={'/prototypes' as never} search={{ q: person.key } as never} className="text-sm font-medium hover:underline">{person.name}</Link>{person.key === snapshot.actor && <span className="ml-2 text-xs text-muted-foreground">You</span>}<p className="mt-1 text-xs text-muted-foreground">{person.key}{person.github && ` · @${person.github}`}</p></div>
              {draft.usage === 'team' && editable ? <div className="flex items-center gap-2"><Checkbox id={`admin-${person.key}`} checked={Boolean(admin)} disabled={disabled} onCheckedChange={(checked) => update({ admins: checked ? [...(draft.admins ?? []), person.key] : (draft.admins ?? []).filter((key) => key !== person.key) })} /><Label htmlFor={`admin-${person.key}`}>Admin<span className="sr-only"> for {person.name}</span></Label></div> : <span className="text-xs text-muted-foreground">{admin ? 'Admin' : 'Contributor'}</span>}
            </li>;
          })}</ul>
          <p className="text-xs text-muted-foreground">Ask your agent to add or update contributor profiles. Roles guide local behavior and do not grant repository access or change prototype ownership.</p>
        </Section>
        {editable && <div className="space-y-3">
          {adminProblems(draft, snapshot.contributors.map((person) => person.key)).length > 0 && <p role="alert" className="text-sm text-destructive">Team use requires at least one registered Admin.</p>}
          <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-muted-foreground">{restarting ? 'Restarting the studio' : dirty ? 'Unsaved changes. Saving restarts the studio.' : 'Your settings are up to date.'}</p><div className="flex gap-2"><Button type="button" variant="outline" disabled={!dirty || disabled} onClick={() => { setDraft(snapshot.config); setError(''); setConflict(false); }}>Discard</Button><Button type="submit" disabled={!dirty || disabled || conflict || !draft.name.trim() || adminProblems(draft, snapshot.contributors.map((person) => person.key)).length > 0}>{saving ? 'Saving' : 'Save changes'}</Button></div></div>
        </div>}
      </form>
    </>}
    <Dialog open={blocker.status === 'blocked'} onOpenChange={(open) => { if (!open && blocker.status === 'blocked') blocker.reset(); }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader><DialogTitle>Discard your changes?</DialogTitle><DialogDescription>You have unsaved settings. They’ll be lost if you leave.</DialogDescription></DialogHeader>
        <DialogFooter><Button variant="outline" onClick={() => blocker.reset?.()}>Keep editing</Button><Button onClick={() => blocker.proceed?.()}>Discard and leave</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </main>;
}
