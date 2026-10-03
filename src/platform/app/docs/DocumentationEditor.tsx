import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/platform/components/button';
import SourcePane, { type SourceAccess } from '@/platform/modules/prototypes/viewer/SourcePane';
import type { Prototype } from '@/platform/app/data/types';
import { documentationRequest } from './documentationSource';

export default function DocumentationEditor({ path }: { path: string }) {
  const navigate = useNavigate();
  const source = useMemo<SourceAccess>(() => ({ path, editable: true, read: () => documentationRequest('read', path), write: (content, base) => documentationRequest('write', path, { content, base }) }), [path]);
  const proto: Prototype = { contributorKey: 'documentation', id: 'source', title: 'Documentation', description: '', contributor: '', created: null, system: '', start: null, artifacts: [] };
  const done = <Button size="sm" variant="outline" onClick={() => navigate({ to: '.', search: ((previous: object) => ({ ...previous, mode: undefined })) as never })}>Done</Button>;
  return <div className="flex h-full min-h-0 flex-col">
    <p className="shrink-0 border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground">Shared platform documentation. Changes affect the studio and may also change its Guide chapter. You are editing the complete source file.</p>
    <SourcePane key={path} proto={proto} item={{ path, fileType: 'handbook' }} source={source} actions={done} />
  </div>;
}
