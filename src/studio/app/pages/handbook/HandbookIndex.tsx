// The Handbook: the team's context and instructions. Its sections (docs, rules, skills) are
// folders in src/handbook/, opened with the same navigation as a prototype and always read-only.
import { getRouteApi, Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/studio/components/card';
import { prototypeLink } from '@/studio/app/data/manifest';

const rootApi = getRouteApi('__root__');

export default function HandbookIndex() {
  const { handbook } = rootApi.useLoaderData();
  return (
    <main data-doc-scroll className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Handbook</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your team's context and instructions, for the people and the agents who work here. Docs say what good design means and who it's for. Rules are what your agent knows and follows every session. Skills are procedures it follows when you ask.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {handbook.map((section) => (
            <Link key={section.id} {...prototypeLink(section)} className="block">
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardContent className="flex flex-col gap-2">
                  <div className="text-sm font-semibold leading-snug text-foreground">{section.title}</div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{section.description}</p>
                  <span className="text-xs text-muted-foreground">{section.items.length} {section.items.length === 1 ? 'file' : 'files'}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          These are platform files: whoever maintains this environment owns them, and changes are reviewed like code. You can read them here. To change one, ask your agent to edit the file in <code className="rounded bg-muted px-1 py-0.5 text-xs">src/handbook/</code>.
        </p>
      </div>
    </main>
  );
}
