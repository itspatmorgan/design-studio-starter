// How the app opens a view: its component, in its prototype system's theme.
import { CodeIcon } from '@hugeicons/core-free-icons';
import type { FileTypeModule } from '@/platform/app/data/fileTypeModule';
import { loadPreview } from './preview/target';
import { previewUrl } from './preview/protocol';
import ViewEmbed from './ViewEmbed';
import ViewFrame from './ViewFrame';

export default {
  icon: CodeIcon,
  load: async context => loadPreview(context),
  Page: ViewFrame,
  Embed: ViewEmbed,
  actions: [{
    id: 'view.open-preview', label: 'Open preview directly', localOnly: false, mutates: false,
    run(context) {
      const descriptor = loadPreview(context);
      const href = import.meta.env.BASE_URL.replace(/\/$/, '') + descriptor.href;
      const url = previewUrl({ target: descriptor.target, href, dark: document.documentElement.classList.contains('dark'), surface: 'page' }, crypto.randomUUID(), import.meta.env.BASE_URL);
      window.open(url, '_blank', 'noopener,noreferrer');
    },
  }],
} satisfies FileTypeModule;
