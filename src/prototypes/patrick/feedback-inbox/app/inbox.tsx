// Screen 1 of 3: the inbox. A list you can filter and search, a panel to add feedback, and a menu on
// each row. Click a row to open it on the next screen.
import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { Button } from '@/systems/product/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/systems/product/components/dropdown-menu';
import { Input } from '@/systems/product/components/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/systems/product/components/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/systems/product/components/table';
import { Tabs, TabsList, TabsTrigger } from '@/systems/product/components/tabs';
import AppShell from './components/AppShell';
import FeedbackForm from './components/FeedbackForm';
import { PriorityBadge, StatusBadge } from './components/badges';
import { useScreenPath } from './components/nav';
import { STATUSES, addFeedback, formatDate, removeFeedback, select, updateFeedback, useStore, type Status } from './components/store';

type Filter = Status | 'all';

export default function Inbox() {
  const { items } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const screen = useScreenPath();

  const open = (id: string) => { select(id); navigate({ to: screen('app/detail') as never }); };
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((f) => (filter === 'all' || f.status === filter) && (!q || `${f.title} ${f.customer} ${f.tags.join(' ')}`.toLowerCase().includes(q)));
  }, [items, filter, query]);
  const count = (s: Filter) => (s === 'all' ? items.length : items.filter((f) => f.status === s).length);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">Everything customers have told us, in one place.</p>
          </div>
          <Button onClick={() => setAdding(true)}><Plus /> New feedback</Button>
        </header>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All <span className="text-muted-foreground">{count('all')}</span></TabsTrigger>
              {STATUSES.map((s) => <TabsTrigger key={s.value} value={s.value}>{s.label} <span className="text-muted-foreground">{count(s.value)}</span></TabsTrigger>)}
            </TabsList>
          </Tabs>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search feedback" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Feedback</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((f) => (
                <TableRow key={f.id} className="cursor-pointer" onClick={() => open(f.id)}>
                  <TableCell className="font-medium">{f.title}</TableCell>
                  <TableCell className="text-muted-foreground">{f.customer}<span className="text-xs"> · {f.source}</span></TableCell>
                  <TableCell><PriorityBadge priority={f.priority} /></TableCell>
                  <TableCell><StatusBadge status={f.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(f.createdAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${f.title}`} />}><MoreHorizontal /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => open(f.id)}>Open</DropdownMenuItem>
                        <DropdownMenuItem disabled={f.status === 'resolved'} onClick={() => updateFeedback(f.id, { status: 'resolved' })}>Mark resolved</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => removeFeedback(f.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {shown.length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium">{items.length === 0 ? 'No feedback yet' : 'Nothing matches'}</p>
              <p className="mt-1 text-sm text-muted-foreground">{items.length === 0 ? 'Add the first piece, or reset the sample data.' : 'Try another status or search.'}</p>
            </div>
          )}
        </div>
      </div>

      <Sheet open={adding} onOpenChange={setAdding}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>New feedback</SheetTitle>
            <SheetDescription>Capture what you heard. You can triage it from the inbox.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <FeedbackForm submitLabel="Add feedback" onCancel={() => setAdding(false)} onSubmit={(input) => { addFeedback(input); setAdding(false); }} />
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
