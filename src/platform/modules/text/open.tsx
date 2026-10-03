// How the app opens a text file: its text, read-only. In dev that's the Source view, with
// highlighting; the deployed site shows the text plainly.
import { lazy } from 'react';
import { CodeIcon } from '@hugeicons/core-free-icons';
import type { FileTypeModule } from '@/platform/app/data/fileTypeModule';
import type { Artifact, Prototype } from '@/platform/app/data/types';
import { rootOf } from '@/platform/core/roots';
import { textFiles } from './loader';

const SourcePane = import.meta.env.DEV ? lazy(() => import('@/platform/modules/prototypes/viewer/SourcePane')) : null;

type Props = { proto: Prototype; item: Artifact; text: string | null };

function TextPage({ proto, item, text }: Props) {
  if (text === null) return SourcePane && <SourcePane proto={proto} item={item} />;
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex h-[57px] shrink-0 items-center border-b border-border px-4 font-mono text-[12px] text-muted-foreground">{item.path}</div>
      <pre className="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-[13px] leading-relaxed"><code>{text}</code></pre>
    </div>
  );
}

export default {
  icon: CodeIcon,

  async load({ proto, item }) {
    if (import.meta.env.DEV) return { proto, item, text: null };
    const text = await textFiles[`/${rootOf(proto.contributorKey, proto.id)}/${item.path}`]?.();
    return text === undefined ? undefined : { proto, item, text };
  },

  Page: TextPage,
} satisfies FileTypeModule<Props>;
