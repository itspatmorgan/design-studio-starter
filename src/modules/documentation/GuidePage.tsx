import { lazy, Suspense } from 'react';
import { Link, getRouteApi } from '@tanstack/react-router';
import { DocLayout } from '@/platform/app/docs/DocLayout';
import { DocBase } from '@/platform/app/docs/DocBase';
import type { GuideModule } from './loadGuide';
import { useSourceView } from '@/platform/core/source/useSourceView';

const DocumentationEditor = import.meta.env.DEV ? lazy(() => import('@/platform/app/docs/DocumentationEditor')) : null;

const rootApi = getRouteApi('__root__');

type Props = { slug: string; Component?: GuideModule['default']; source?: { path: string }; title?: string; description?: string; toc?: boolean };

export default function GuidePage({ slug, source, ...props }: Props) {
  const { guide } = rootApi.useLoaderData();
  const file = guide.find((page) => page.slug === slug)?.source ?? `/modules/documentation/pages/${slug}.md`;
  const { rendered } = useSourceView(import.meta.env.DEV, Boolean(source));
  // Only enabled pages participate. Release history is separate from the reading sequence.
  const chapters = guide.filter((page) => page.section !== 'Releases');
  const current = chapters.findIndex((page) => page.slug === slug);
  const previous = current > 0 ? chapters[current - 1] : undefined;
  const next = current >= 0 ? chapters[current + 1] : undefined;
  const footer = (previous || next) && (
    <nav aria-label="Guide chapters" className="mt-12 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
      {previous ? (
        <Link to={(previous.slug === 'index' ? '/documentation/guide' : '/documentation/guide/$page') as never} params={{ page: previous.slug } as never} className="min-w-0 rounded-md p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
          <span className="block text-xs text-muted-foreground">Previous</span>
          <span className="mt-1 block font-medium">{previous.title}</span>
        </Link>
      ) : <span />}
      {next && (
        <Link to={'/documentation/guide/$page' as never} params={{ page: next.slug } as never} className="min-w-0 rounded-md p-2 text-right hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
          <span className="block text-xs text-muted-foreground">Next</span>
          <span className="mt-1 block font-medium">{next.title}</span>
        </Link>
      )}
    </nav>
  );
  if (source && DocumentationEditor) return <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Opening source…</p>}><DocumentationEditor path={source.path} /></Suspense>;
  if (!props.Component) return null;
  return <div ref={rendered} tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none"><DocBase.Provider value={file.slice(0, file.lastIndexOf('/'))}><DocLayout {...props} Component={props.Component} scrollKey={slug} footer={footer} /></DocBase.Provider></div>;
}
