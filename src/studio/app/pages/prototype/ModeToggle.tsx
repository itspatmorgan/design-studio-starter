// Preview | Source, in the prototype navigation: switch the open item between its page and its
// text (SourcePane.tsx). It's in the navigation, not the page, because items fill their pages
// differently. Dev only, and only for types that have source (language in their type.ts).
import { useNavigate, useSearch } from '@tanstack/react-router';
import { FILE_TYPES } from '@/studio/app/data/fileTypes';
import { useMe } from '@/studio/app/data/files';
import type { Item } from '@/studio/app/data/types';
import { Tabs, TabsList, TabsTrigger } from '@/studio/components/tabs';

export default function ModeToggle({ current }: { current: Item | undefined }) {
  const me = useMe();
  const navigate = useNavigate();
  const { mode } = useSearch({ strict: false }) as { mode?: 'source' };
  // import.meta.env.DEV is false in the build, so the toggle isn't in the deployed site.
  if (!import.meta.env.DEV || me === null || !current || !FILE_TYPES[current.fileType]?.language) return null;
  return (
    <div className="shrink-0 px-2 pt-2">
      <Tabs
        value={mode ?? 'preview'}
        onValueChange={(value) => navigate({ to: '.', search: ((prev: object) => ({ ...prev, mode: value === 'source' ? 'source' : undefined })) as never })}
        className="px-2.5"
      >
        <TabsList className="w-full">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
