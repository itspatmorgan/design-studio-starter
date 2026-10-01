// The app's front page: a greeting, and under it one small panel of what each module chooses to show (its `overview`,
// src/platform/app/modules.ts), in the order of the rail. The panel is narrow and centred, so it reads as a
// welcome rather than a page to fill, and stays comfortable in the narrow window an agent's harness gives the app.
// The modules decide what is worth showing, so a module added to the app can put something here with no change to this file.
import { getRouteApi } from '@tanstack/react-router';
import { APP_NAME } from '@/platform/app/data/config';
import { moduleApps } from '@/platform/app/modules';
import { useMyName } from '@/platform/app/data/files';

const rootApi = getRouteApi('__root__');

export default function Home() {
  const manifest = rootApi.useLoaderData();
  // While you run the app locally it greets you; the deployed site, which doesn't know who is looking, names the app.
  // Until the dev server says who you are the heading is blank, so it doesn't change under you.
  const name = useMyName();
  const first = name?.split(' ')[0];
  const heading = name === undefined ? '\u00a0' : first ? `Welcome back, ${first}` : APP_NAME;
  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-[12vh] pb-10">
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">{heading}</h1>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {moduleApps.map(({ spec, app }) => app.overview && <app.overview key={spec.id} manifest={manifest} />)}
      </div>
    </main>
  );
}
