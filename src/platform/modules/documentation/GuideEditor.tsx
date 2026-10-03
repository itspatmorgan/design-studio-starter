import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import SourcePane, { type SourceAccess } from '@/platform/modules/prototypes/viewer/SourcePane';
import type { Prototype } from '@/platform/app/data/types';
import { Button } from '@/platform/components/button';
import { readGuideSource, writeGuideSource } from './source';

export default function GuideEditor({ slug, path }: { slug: string; path: string }) {
  const navigate = useNavigate();
  const source = useMemo<SourceAccess>(() => ({
    path, editable: true,
    read: () => readGuideSource(slug),
    write: (content, base) => writeGuideSource(slug, content, base),
  }), [slug, path]);
  // The shared editor uses the required Handbook Markdown language. Access belongs to Guide.
  const proto: Prototype = { contributorKey: 'documentation', id: slug, title: slug, description: '', contributor: '', created: null, system: '', start: null, artifacts: [] };
  const done = <Button size="sm" variant="outline" onClick={() => navigate({ to: '.', search: ((previous: object) => ({ ...previous, mode: undefined })) as never })}>Done</Button>;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground">Shared platform documentation. You are editing the complete file; module README changes also affect Reference and developer documentation.</p>
      <SourcePane key={path} proto={proto} item={{ path, fileType: 'handbook' }} source={source} actions={done} />
    </div>
  );
}
