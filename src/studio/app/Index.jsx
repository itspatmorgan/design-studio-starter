import { Card, CardDescription, CardHeader, CardTitle } from '@/studio/components/card';
import { Link } from './navigate.jsx';

// A prototype opens on prototype.jsx, or its first view if there isn't one.
export function firstView(p) {
  return p.views.find((v) => v.name === 'prototype.jsx' && !v.group) ?? p.views[0];
}

export default function Index({ manifest }) {
  let body;
  if (!manifest) body = <p className="text-muted-foreground">Loading…</p>;
  else if (!manifest.prototypes.length) body = <p className="text-muted-foreground">No prototypes yet. Ask your agent to make one.</p>;
  else body = (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {manifest.prototypes.map((p) => {
        const v = firstView(p);
        return (
          <li key={`${p.contributorKey}/${p.id}`}>
            <Link to={{ contributor: p.contributorKey, prototype: p.id, group: v?.group, view: v?.name }} className="block h-full">
              <Card className="h-full transition-shadow hover:ring-2 hover:ring-ring">
                <CardHeader>
                  <CardTitle>{p.title}</CardTitle>
                  {p.description && <CardDescription>{p.description}</CardDescription>}
                  <p className="pt-2 text-xs text-muted-foreground">{p.contributor || p.contributorKey}</p>
                </CardHeader>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-xl font-semibold">Prototypes</h1>
      {body}
    </main>
  );
}
