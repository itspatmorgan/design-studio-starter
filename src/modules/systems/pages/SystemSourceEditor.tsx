import { useMemo } from 'react';
import { Button } from '@/systems/studio/components/button';
import SourceEditor from '@/platform/core/source/SourceEditor';
import type { SourceAccess } from '@/platform/core/source/access';
import { shortcutLabel } from '@/platform/app/shell/artifactShortcuts';
import { systemSourceRequest } from './systemSource';

export default function SystemSourceEditor({ path, onDone }: { path: string; onDone: () => void }) {
  const source = useMemo<SourceAccess>(() => ({ path, editable: true, read: () => systemSourceRequest('read', path), write: (content, base) => systemSourceRequest('write', path, { content, base }) }), [path]);
  return <SourceEditor source={source} language="text" actions={<Button size="sm" variant="outline" onClick={onDone} title={`Return to rendered view (${shortcutLabel('source')})`}>Done</Button>} />;
}
