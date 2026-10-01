// The app's front page: a greeting, then one card for each module that has a section, in the order of the rail. A card links to the
// module's own page and shows what the module says about itself (its description) and, if it has one, its
// `overview` (src/platform/app/modules.ts), like how many prototypes there are. A module added to the app
// appears here with no change to this file.
import { getRouteApi, Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent } from '@/platform/components/card';
import { APP_NAME } from '@/platform/app/data/config';
import { moduleApps, sectionPath } from '@/platform/app/modules';
import { useMyName } from '@/platform/app/data/files';
import { cn } from '@/lib/utils';

const rootApi = getRouteApi('__root__');

export default function Home() {
  const manifest = rootApi.useLoaderData();
  const cards = moduleApps.filter(({ spec }) => spec.section);
  // While you run the app locally it greets you; the deployed site, which doesn't know who is looking, names the app.
  // Until the dev server says who you are the heading is blank, so it doesn't change under you.
  const name = useMyName();
  const first = name?.split(' ')[0];
  const heading = name === undefined ? '\u00a0' : first ? `Welcome back, ${first}` : APP_NAME;
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-12 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{heading}</h1>
      </header>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ spec, app }) => (
          <li key={spec.id}>
            <Link to={sectionPath(spec) as never} className="block h-full">
              <Card className={cn('h-full transition-colors hover:bg-muted/40')}>
                <CardContent className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <HugeiconsIcon icon={app.icon} size={16} />
                    {spec.label}
                  </div>
                  {spec.description && <p className="text-xs leading-relaxed text-muted-foreground">{spec.description}</p>}
                  {app.overview && <div className="mt-auto pt-1 text-xs text-foreground"><app.overview manifest={manifest} /></div>}
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
