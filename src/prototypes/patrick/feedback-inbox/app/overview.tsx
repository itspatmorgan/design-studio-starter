// Screen 3 of 3: an overview. Two small breakdowns and the newest items. Everything here is computed from
// the same data as the inbox, so it changes when you add, edit, or delete.
import { Card, CardContent, CardHeader, CardTitle } from '@/systems/product/components/card';
import AppShell from './components/AppShell';
import { PriorityBadge, StatusBadge } from './components/badges';
import { ScreenLink, useScreenPath } from './components/nav';
import { useNavigate } from '@tanstack/react-router';
import { SOURCES, STATUSES, formatDate, select, useStore } from './components/store';

function Bars({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[5.5rem_1fr_1.5rem] items-center gap-3 text-sm">
          <span className="text-muted-foreground">{r.label}</span>
          <span className="h-2 rounded-full bg-muted"><span className="block h-2 rounded-full bg-primary" style={{ width: `${(r.count / max) * 100}%` }} /></span>
          <span className="text-right tabular-nums">{r.count}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Overview() {
  const { items } = useStore();
  const navigate = useNavigate();
  const screen = useScreenPath();
  const newest = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-8">
        <header className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">How the feedback breaks down, and what came in last.</p>
        </header>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>By status</CardTitle></CardHeader><CardContent><Bars rows={STATUSES.map((s) => ({ label: s.label, count: items.filter((f) => f.status === s.value).length }))} /></CardContent></Card>
          <Card><CardHeader><CardTitle>By source</CardTitle></CardHeader><CardContent><Bars rows={SOURCES.map((s) => ({ label: s.label, count: items.filter((f) => f.source === s.value).length }))} /></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Newest</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {newest.map((f) => (
                <li key={f.id}>
                  <button type="button" className="flex w-full items-center gap-3 py-2.5 text-left text-sm hover:text-primary" onClick={() => { select(f.id); navigate({ to: screen('app/detail') as never }); }}>
                    <span className="flex-1 truncate font-medium">{f.title}</span>
                    <PriorityBadge priority={f.priority} />
                    <StatusBadge status={f.status} />
                    <span className="w-14 text-right text-xs text-muted-foreground">{formatDate(f.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <ScreenLink to="app/inbox" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">See everything in the inbox</ScreenLink>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
