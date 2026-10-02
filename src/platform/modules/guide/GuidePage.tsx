import { lazy, Suspense, type ComponentProps } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router';
import { DocLayout } from '@/platform/app/docs/DocLayout';
import type { GuideModule } from './loadGuide';
import { Button } from '@/platform/components/button';
import studioParts from './assets/studio-parts.svg';
import agentCycle from './assets/agent-cycle.svg';
import saveAndShare from './assets/save-and-share.svg';

const GuideEditor = import.meta.env.DEV ? lazy(() => import('./GuideEditor')) : null;

const rootApi = getRouteApi('__root__');
// Markdown uses readable image addresses; Vite owns the module's actual asset URLs.
const diagrams: Record<string, string> = {
  '/guide/studio-parts.svg': studioParts,
  '/guide/agent-cycle.svg': agentCycle,
  '/guide/save-and-share.svg': saveAndShare,
};
const components = {
  img: ({ src, ...props }: ComponentProps<'img'>) => <img {...props} src={typeof src === 'string' ? diagrams[src] ?? src : src} />,
};

type Props = { slug: string; Component?: GuideModule['default']; source?: { path: string }; title?: string; description?: string; toc?: boolean };

export default function GuidePage({ slug, source, ...props }: Props) {
  const { guide } = rootApi.useLoaderData();
  const navigate = useNavigate();
  // Only enabled pages participate. Release history is separate from the reading sequence.
  const chapters = guide.filter((page) => page.section !== 'Releases');
  const current = chapters.findIndex((page) => page.slug === slug);
  const previous = current > 0 ? chapters[current - 1] : undefined;
  const next = current >= 0 ? chapters[current + 1] : undefined;
  const footer = (previous || next) && (
    <nav aria-label="Guide chapters" className="mt-12 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
      {previous ? (
        <Link to={(previous.slug === 'index' ? '/guide' : '/guide/$page') as never} params={{ page: previous.slug } as never} className="min-w-0 rounded-md p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
          <span className="block text-xs text-muted-foreground">Previous</span>
          <span className="mt-1 block font-medium">{previous.title}</span>
        </Link>
      ) : <span />}
      {next && (
        <Link to={'/guide/$page' as never} params={{ page: next.slug } as never} className="min-w-0 rounded-md p-2 text-right hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
          <span className="block text-xs text-muted-foreground">Next</span>
          <span className="mt-1 block font-medium">{next.title}</span>
        </Link>
      )}
    </nav>
  );
  if (source && GuideEditor) return <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Opening source…</p>}><GuideEditor slug={slug} path={source.path} /></Suspense>;
  if (!props.Component) return null;
  const edit = import.meta.env.DEV && <Button size="sm" variant="outline" className="shrink-0" onClick={() => navigate({ to: '.', search: ((previous: object) => ({ ...previous, mode: 'source' })) as never })}>Edit</Button>;
  return <MDXProvider components={components}><DocLayout {...props} Component={props.Component} actions={edit} scrollKey={slug} footer={footer} /></MDXProvider>;
}
