import { useEffect, useState, type ReactNode } from 'react';
import { Link, useBlocker } from '@tanstack/react-router';
import { Button } from '@/systems/studio/components/button';
import { Input } from '@/systems/studio/components/input';
import { adminProblems, type StudioConfig } from '@/platform/core/config';

type Snapshot = {
  config: StudioConfig; version: string; actor: string | null; role: 'admin' | 'contributor' | null;
  contributors: { key: string; name: string; github: string }[];
  modules: { id: string; label: string; description?: string; optional: boolean; compatible: boolean }[];
  systems: { id: string; label: string }[];
};

const selectStyle = 'h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
    <header><h2 id={`${id}-title`} className="text-base font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></header>
    {children}
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

  return <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
    <header className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold tracking-tight">Studio settings</h1>
        {snapshot && <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium">{snapshot.role === 'admin' ? 'Admin' : snapshot.role === 'contributor' ? 'Contributor' : 'Not registered'}</span>}
      </div>
      <p className="text-sm text-muted-foreground">Configure your studio, choose its capabilities, and see who contributes.</p>
      <p className="text-xs text-muted-foreground">Changes save to your local repository. Share them through your team’s Git workflow.</p>
    </header>
    {error && <div role="alert" className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
      <p className="whitespace-pre-line">{error}</p><Button variant="outline" onClick={() => { if (!dirty || window.confirm('Discard unsaved settings and reload?')) void load(); }}>Reload settings</Button>
    </div>}
    {saved && <p role="status" className="rounded-lg bg-muted p-4 text-sm">Settings saved. {sessionStorage.getItem('studio:settings-saved') ? 'The studio is restarting to apply your changes.' : 'Your changes are applied locally.'}</p>}
    {!snapshot || !draft ? (!error && <p role="status" className="text-sm text-muted-foreground">Loading settings</p>) : <>
      {!editable && <p className="rounded-lg bg-muted p-4 text-sm">{snapshot.role ? 'You can view these settings. An Admin can change them.' : 'Ask your agent to register your contributor identity before editing settings.'}</p>}
      <nav aria-label="Settings sections" className="flex gap-5 text-sm">
        {['General', 'Modules', 'Contributors'].map((title) => <a key={title} href={`#${title.toLowerCase()}`} onClick={(event) => {
          event.preventDefault();
          const main = event.currentTarget.closest('main');
          const scroller = main?.parentElement;
          const section = main?.querySelector(`#${title.toLowerCase()}`);
          if (scroller && section) scroller.scrollTo({ top: scroller.scrollTop + section.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 24 });
        }} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">{title}</a>)}
      </nav>
      <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); void save(); }}>
        <Section id="general" title="General" description="The shared identity and defaults for your studio.">
          <fieldset disabled={disabled} className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Studio name</span><Input value={draft.name} required onChange={(event) => update({ name: event.target.value })} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Studio use</span><select className={selectStyle} value={draft.usage} onChange={(event) => update({ usage: event.target.value as StudioConfig['usage'] })}><option value="personal">Personal</option><option value="team">Team</option></select></label>
            <label className="space-y-2 text-sm font-medium sm:col-span-2"><span>Tagline</span><Input value={draft.tagline ?? ''} maxLength={140} onChange={(event) => update({ tagline: event.target.value })} /><span className="block text-xs font-normal text-muted-foreground">An optional introduction on the published Home. Up to 140 characters.</span></label>
            <label className="space-y-2 text-sm font-medium sm:col-span-2"><span>Default design system</span><select className={selectStyle} value={draft.defaultSystem} onChange={(event) => update({ defaultSystem: event.target.value })}>{snapshot.systems.map((system) => <option key={system.id} value={system.id}>{system.label}</option>)}</select><span className="block text-xs font-normal text-muted-foreground">Existing prototypes keep their current system when you change this default.</span></label>
          </fieldset>
        </Section>
        <Section id="modules" title="Modules" description="Turn optional capabilities on or off. Disabling a module keeps its files and content.">
          <div className="divide-y divide-border">{snapshot.modules.map((module) => <div key={module.id} className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
            <div><label htmlFor={`module-${module.id}`} className="text-sm font-medium">{module.label}</label><p className="mt-1 text-xs text-muted-foreground">{module.description}</p><p className="mt-1 text-xs text-muted-foreground">{module.optional ? 'Optional' : 'Required'}{!module.compatible && ' · Incompatible with this platform'}</p></div>
            <div className="flex shrink-0 items-center gap-2"><span className="text-xs text-muted-foreground">{draft.modules[module.id] ? 'On' : 'Off'}</span><input id={`module-${module.id}`} type="checkbox" role="switch" checked={draft.modules[module.id]} disabled={disabled || !module.optional || (!module.compatible && !draft.modules[module.id])} onChange={(event) => update({ modules: { ...draft.modules, [module.id]: event.target.checked } })} className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-ring" /></div>
          </div>)}</div>
        </Section>
        <Section id="contributors" title="Contributors" description={draft.usage === 'personal' ? 'In personal use, your local contributor automatically has Admin capabilities.' : 'Contributors own their prototypes. Admins also manage shared settings. Choose at least one Admin.'}>
          <ul className="divide-y divide-border">{snapshot.contributors.map((person) => {
            const admin = draft.usage === 'personal' ? person.key === snapshot.actor : draft.admins?.includes(person.key);
            return <li key={person.key} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
              <div><Link to={'/prototypes' as never} search={{ q: person.key } as never} className="text-sm font-medium hover:underline">{person.name}</Link>{person.key === snapshot.actor && <span className="ml-2 text-xs text-muted-foreground">You</span>}<p className="mt-1 text-xs text-muted-foreground">{person.key}{person.github && ` · @${person.github}`}</p></div>
              {draft.usage === 'team' && editable ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(admin)} disabled={disabled} onChange={(event) => update({ admins: event.target.checked ? [...(draft.admins ?? []), person.key] : (draft.admins ?? []).filter((key) => key !== person.key) })} className="size-4 accent-primary" />Admin<span className="sr-only"> for {person.name}</span></label> : <span className="text-xs text-muted-foreground">{admin ? 'Admin' : 'Contributor'}</span>}
            </li>;
          })}</ul>
          <p className="text-xs text-muted-foreground">Ask your agent to add or update contributor profiles. Roles guide local behavior and do not grant repository access or change prototype ownership.</p>
        </Section>
        {editable && <div className="sticky bottom-0 space-y-3 rounded-xl border border-border bg-background p-4">
          {adminProblems(draft, snapshot.contributors.map((person) => person.key)).length > 0 && <p role="alert" className="text-sm text-destructive">Team use requires at least one registered Admin.</p>}
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{restarting ? 'Restarting the studio' : dirty ? 'Unsaved changes. Saving restarts the studio.' : 'Your settings are up to date.'}</p><div className="flex gap-2"><Button type="button" variant="outline" disabled={!dirty || disabled} onClick={() => { setDraft(snapshot.config); setError(''); setConflict(false); }}>Discard</Button><Button type="submit" disabled={!dirty || disabled || conflict || !draft.name.trim() || adminProblems(draft, snapshot.contributors.map((person) => person.key)).length > 0}>{saving ? 'Saving' : 'Save changes'}</Button></div></div>
        </div>}
      </form>
    </>}
    {blocker.status === 'blocked' && <div role="alert" className="sticky bottom-0 space-y-3 rounded-lg border border-border bg-background p-4"><p className="text-sm">You have unsaved settings. Discard them and leave?</p><div className="flex gap-2"><Button onClick={() => blocker.reset()}>Keep editing</Button><Button variant="outline" onClick={() => blocker.proceed()}>Discard and leave</Button></div></div>}
  </main>;
}
