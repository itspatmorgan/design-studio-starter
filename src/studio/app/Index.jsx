import { Card, CardDescription, CardHeader, CardTitle } from '@/studio/components/card';
import { Link } from './navigate.jsx';

export function firstView(p) {
  return p.views.find((v) => v.name === 'prototype.jsx' && !v.group) ?? p.views[0];
}

export default function Index({ manifest }) {
  if (!manifest) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (!manifest.prototypes.length) return <p className="p-6 text-muted-foreground">No prototypes yet.</p>;
  return (
    <main className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {manifest.prototypes.map((p) => {
        const v = firstView(p);
        return (
          <Link key={`${p.contributorKey}/${p.id}`} to={{ contributor: p.contributorKey, prototype: p.id, group: v?.group, view: v?.name }}>
            <Card className="h-full hover:ring-2 hover:ring-ring">
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>{p.description}</CardDescription>
                <p className="text-xs text-muted-foreground">{p.contributor || p.contributorKey}</p>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </main>
  );
}
